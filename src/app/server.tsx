import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";

export const Page = () => {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUser.queryOptions())

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Client />
      </HydrationBoundary>
    </div>
  )

}