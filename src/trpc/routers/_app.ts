import { createTRPCRouter } from "../init";
import { workflowsRouter } from "./workflows";
import { nodesRouter } from "./nodes";
import { executionsRouter } from "./executions";
import { executorsRouter } from "./executors";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter,
  executions: executionsRouter,
  executors: executorsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
