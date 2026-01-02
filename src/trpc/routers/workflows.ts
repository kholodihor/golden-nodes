import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/config/constants";

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

const paginationSchema = z.object({
  page: z.number().min(PAGINATION.MIN_PAGE).default(PAGINATION.DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(PAGINATION.MIN_PAGE_SIZE)
    .max(PAGINATION.MAX_PAGE_SIZE)
    .default(PAGINATION.DEFAULT_PAGE_SIZE),
  search: z.string().default(""),
});

const getWorkflowSchema = z.object({
  id: z.string(),
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
  getMany: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;

      // Build where clause with optional search
      const whereClause = {
        userId: ctx.auth.user.id,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }),
      };

      const [workflows, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          where: whereClause,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
        prisma.workflow.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        workflows,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          search,
        },
      };
    }),

  // READ - Get a single workflow by ID
  getById: protectedProcedure
    .input(getWorkflowSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.auth.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      return prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
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
