import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { getQueryClient, trpc } from "@/src/trpc/server";

export default function Home() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Client />
      </HydrationBoundary>
    </div>
  );
}
