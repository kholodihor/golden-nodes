import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  getUser: baseProcedure
    .query((opts) => {
      return {
        spell: `Lathspell I name You`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;