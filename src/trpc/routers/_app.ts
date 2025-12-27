import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/prisma';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  getWorkflows: baseProcedure
    .query(async () => {
      const workflows = await prisma.workflow.findMany()
      return {
        workflows
      };
    }),
  createWorkflow: baseProcedure
    .input(z.object({
      name: z.string()
    }))
    .mutation(async ({ input }) => {
      await inngest.send({
        name: 'test/create.workflow',
        data: {
          name: input.name
        }
      });
      return { success: true, message: 'Job queued' }
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;