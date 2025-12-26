import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/prisma';

export const appRouter = createTRPCRouter({
  getUsers: baseProcedure
    .query(async () => {
      const users = await prisma.user.findMany()
      return {
        users
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;