'use client'

import { useTRPC } from "@/src/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return <div>{JSON.stringify(data.users[0], null, 2)}</div>
}