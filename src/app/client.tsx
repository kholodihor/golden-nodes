"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import Editor from "@/components/editor/editor";

export const Client = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.workflows.getMany.queryOptions({}));

  const create = useMutation(
    trpc.workflows.create.mutationOptions({
      onError: (error: unknown) => {
        console.error(error);
      },

      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-center items-center gap-2 p-4">
        {JSON.stringify((data as any).workflows, null, 2)}
        <Button
          disabled={create.isPending}
          onClick={() => create.mutate({ name: "New Test Workflow 22" })}
        >
          Create Test Workflow
        </Button>
      </div>

      <div className="h-screen">
        <Editor />
      </div>
    </div>
  );
};
