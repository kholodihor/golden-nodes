import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

export const useCreateeWorkflow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: data => {
        toast.success(`Workflow "${data.name}" created successfully`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        router.push(`/workflows/${data.id}`);
      },

      onError: error => {
        console.error("Failed to create workflow:", error);
        toast.error("Failed to create workflow");
      },
    }),
  );
};

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getById.queryOptions({ id }));
};

export const useWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.workflows.getById.queryOptions({ id }));
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: data => {
        toast.success(`Workflow "${data.name}" updated successfully`);
        queryClient.invalidateQueries(
          trpc.workflows.getById.queryOptions({ id: data.id }),
        );
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },

      onError: error => {
        console.error("Failed to update workflow:", error);
        toast.error("Failed to update workflow");
      },
    }),
  );
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: () => {
        toast.success(`Workflow deleted successfully`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },

      onError: error => {
        console.error("Failed to delete workflow:", error);
        toast.error("Failed to delete workflow");
      },
    }),
  );
};
