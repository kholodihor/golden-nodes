import { createTRPCRouter } from "../init";
import { workflowsRouter } from "./workflows";
import { nodesRouter } from "./nodes";
import { executionsRouter } from "./executions";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter,
  executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
