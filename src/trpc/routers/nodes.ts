import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

// Zod schemas
const createNodeSchema = z.object({
  workflowId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: z.enum(["ACTION", "CONDITION", "START", "END"]),
  data: z.any().optional().default({}),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const updateNodeSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  data: z.any().optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

const deleteNodeSchema = z.object({
  id: z.string().cuid(),
});

const createConnectionSchema = z.object({
  workflowId: z.string().cuid(),
  sourceNodeId: z.string().cuid(),
  targetNodeId: z.string().cuid(),
  sourceHandle: z.string().default("source"),
  targetHandle: z.string().default("target"),
  sourceOutput: z.string().default("main"),
  targetInput: z.string().default("main"),
});

const deleteConnectionSchema = z.object({
  id: z.string().cuid(),
});

export const nodesRouter = createTRPCRouter({
  // NODE CRUD
  create: protectedProcedure
    .input(createNodeSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify workflow belongs to user
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found or access denied",
        });
      }

      const node = await prisma.node.create({
        data: {
          workflowId: input.workflowId,
          name: input.name,
          type: input.type,
          data: input.data as any,
          position: input.position as any,
        },
      });

      return node;
    }),

  update: protectedProcedure
    .input(updateNodeSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify node belongs to user's workflow
      const node = await prisma.node.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
      });

      if (!node) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Node not found or access denied",
        });
      }

      const updatedNode = await prisma.node.update({
        where: { id: input.id },
        data: {
          name: input.name,
          data: input.data as any,
          position: input.position as any,
        },
      });

      return updatedNode;
    }),

  delete: protectedProcedure
    .input(deleteNodeSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify node belongs to user's workflow
      const node = await prisma.node.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
      });

      if (!node) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Node not found or access denied",
        });
      }

      await prisma.node.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // CONNECTION CRUD
  createConnection: protectedProcedure
    .input(createConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify workflow belongs to user
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found or access denied",
        });
      }

      // Verify both nodes belong to the same workflow
      const [sourceNode, targetNode] = await Promise.all([
        prisma.node.findFirst({
          where: { id: input.sourceNodeId, workflowId: input.workflowId },
        }),
        prisma.node.findFirst({
          where: { id: input.targetNodeId, workflowId: input.workflowId },
        }),
      ]);

      if (!sourceNode || !targetNode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Source or target node not found",
        });
      }

      const connection = await prisma.connection.create({
        data: {
          ...input,
          workflowId: input.workflowId,
        },
      });

      return connection;
    }),

  deleteConnection: protectedProcedure
    .input(deleteConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify connection belongs to user's workflow
      const connection = await prisma.connection.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found or access denied",
        });
      }

      await prisma.connection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // GET WORKFLOW WITH NODES AND CONNECTIONS
  getWorkflowWithNodes: protectedProcedure
    .input(z.object({ workflowId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: {
            orderBy: {
              createdAt: "asc",
            },
          },
          connections: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found or access denied",
        });
      }

      return workflow;
    }),
});
