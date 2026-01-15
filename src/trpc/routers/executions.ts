import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";

const executeWorkflowSchema = z.object({
  workflowId: z.string().min(1, "Invalid workflow ID"),
  inputData: z.optional(z.record(z.string(), z.any())).default({}),
});

const getExecutionsSchema = z.object({
  workflowId: z.string().min(1, "Invalid workflow ID").optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

const getExecutionSchema = z.object({
  id: z.string().min(1, "Invalid execution ID"),
});

export const executionsRouter = createTRPCRouter({
  // EXECUTE - Trigger workflow execution
  execute: protectedProcedure
    .input(executeWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify workflow exists and belongs to user
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      // Create workflow execution record
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: input.workflowId,
          status: "PENDING",
          inputData: input.inputData as any,
          outputData: {},
        },
      });

      // Send event to Inngest to start execution
      await inngest.send({
        name: "workflow/execute",
        data: {
          executionId: execution.id,
          workflowId: input.workflowId,
          userId: ctx.auth.user.id,
          inputData: input.inputData,
        },
      });

      return execution;
    }),

  // READ - Get executions for a workflow or all user executions
  getMany: protectedProcedure
    .input(getExecutionsSchema)
    .query(async ({ ctx, input }) => {
      const { workflowId, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      // Build where clause
      const whereClause = {
        workflow: {
          userId: ctx.auth.user.id,
        },
        ...(workflowId && { workflowId }),
      };

      const [executions, totalCount] = await Promise.all([
        prisma.workflowExecution.findMany({
          where: whereClause,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
          include: {
            workflow: {
              select: {
                name: true,
              },
            },
            nodeExecutions: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        }),
        prisma.workflowExecution.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        executions,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };
    }),

  // READ - Get a single execution by ID
  getById: protectedProcedure
    .input(getExecutionSchema)
    .query(async ({ ctx, input }) => {
      const execution = await prisma.workflowExecution.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
        include: {
          workflow: {
            include: {
              nodes: true,
              connections: true,
            },
          },
          nodeExecutions: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!execution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Execution not found",
        });
      }

      return execution;
    }),

  // CANCEL - Cancel a running execution
  cancel: protectedProcedure
    .input(getExecutionSchema)
    .mutation(async ({ ctx, input }) => {
      const execution = await prisma.workflowExecution.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
          status: "RUNNING",
        },
      });

      if (!execution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Running execution not found",
        });
      }

      // Update execution status to cancelled
      const updatedExecution = await prisma.workflowExecution.update({
        where: {
          id: input.id,
        },
        data: {
          status: "CANCELLED",
          completedAt: new Date(),
        },
      });

      // Send cancellation event to Inngest
      await inngest.send({
        name: "workflow/cancel",
        data: {
          executionId: input.id,
          workflowId: execution.workflowId,
          userId: ctx.auth.user.id,
        },
      });

      return updatedExecution;
    }),
});
