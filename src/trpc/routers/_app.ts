import { createTRPCRouter } from "../init";
import { workflowsRouter } from "./workflows";
import { nodesRouter } from "./nodes";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
