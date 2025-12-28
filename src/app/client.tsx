'use client'

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onError: (error) => {
      console.error(error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
    }
  }));

  const testAI = useMutation(trpc.testAI.mutationOptions({
    onError: (error) => {
      console.error(error);
    }
  }))

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      {JSON.stringify(data.workflows, null, 2)}
      <Button disabled={create.isPending} onClick={() => create.mutate({ name: 'New Test Workflow 22' })}>Create Test Workflow</Button>
      <Button disabled={testAI.isPending} onClick={() => testAI.mutate()}>Test AI</Button>
    </div>)
}