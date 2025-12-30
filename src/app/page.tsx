import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { getQueryClient, trpc } from "@/trpc/server";
import { requireAuth } from "@/utils/auth";

export default async function Home() {
  await requireAuth();

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.workflows.getMany.queryOptions());

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Client />
      </HydrationBoundary>
    </div>
  );
}
