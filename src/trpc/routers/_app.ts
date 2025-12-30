import { createTRPCRouter } from "../init";
import { workflowsRouter } from "./workflows";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
