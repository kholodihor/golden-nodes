import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

const createWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

const updateWorkflowSchema = z.object({
  id: z.string().cuid("Invalid workflow ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

const getWorkflowSchema = z.object({
  id: z.string().cuid("Invalid workflow ID"),
});

export const workflowsRouter = createTRPCRouter({
  // CREATE - Create a new workflow
  create: protectedProcedure
    .input(createWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.create({
        data: {
          name: input.name,
          userId: ctx.auth.user.id,
        },
      });

      return workflow;
    }),

  // READ - Get all workflows for the authenticated user
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return workflows;
  }),

  // READ - Get a single workflow by ID
  getById: protectedProcedure
    .input(getWorkflowSchema)
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      return workflow;
    }),

  // UPDATE - Update a workflow
  update: protectedProcedure
    .input(updateWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if workflow exists and belongs to user
      const existingWorkflow = await prisma.workflow.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingWorkflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      const workflow = await prisma.workflow.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });

      return workflow;
    }),

  // DELETE - Delete a workflow
  remove: protectedProcedure
    .input(getWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if workflow exists and belongs to user
      const existingWorkflow = await prisma.workflow.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingWorkflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      await prisma.workflow.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true, message: "Workflow deleted successfully" };
    }),
});
