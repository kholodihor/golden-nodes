'use client';
// <-- hooks can only be used in client components
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function Client() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.getUser.queryOptions());


  return <div>{data.spell}</div>;
}