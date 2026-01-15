import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import {
  getAllNodeSchemas,
  getNodeSchema,
  getAvailableNodeTypes,
} from "@/lib/executors/schemas";

export const executorsRouter = createTRPCRouter({
  // Get all available node schemas
  getAllSchemas: protectedProcedure.query(() => {
    return getAllNodeSchemas();
  }),

  // Get schema for specific node type
  getSchema: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ACTION", "CONDITION", "START", "END"]),
      }),
    )
    .query(({ input }) => {
      return getNodeSchema(input.type);
    }),

  // Get available node types
  getAvailableTypes: protectedProcedure.query(() => {
    return getAvailableNodeTypes();
  }),
});
