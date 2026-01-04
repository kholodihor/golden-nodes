import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Nodes
export function useCreateNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.nodes.create.mutationOptions({
      onSuccess: () => {
        // Invalidate workflow with nodes cache
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return (
              key?.includes?.("getWorkflowWithNodes") ||
              key?.includes?.("nodes.getWorkflowWithNodes")
            );
          },
        });
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent("node-changed"));
      },
    }),
  );
}

export function useUpdateNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.nodes.update.mutationOptions({
      onSuccess: () => {
        console.log(
          "useUpdateNode: onSuccess triggered, dispatching node-changed event",
        );
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return (
              key?.includes?.("getWorkflowWithNodes") ||
              key?.includes?.("nodes.getWorkflowWithNodes")
            );
          },
        });
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent("node-changed"));
      },
    }),
  );
}

export function useDeleteNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.nodes.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return (
              key?.includes?.("getWorkflowWithNodes") ||
              key?.includes?.("nodes.getWorkflowWithNodes")
            );
          },
        });
      },
    }),
  );
}

// Connections
export function useCreateConnection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.nodes.createConnection.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return (
              key?.includes?.("getWorkflowWithNodes") ||
              key?.includes?.("nodes.getWorkflowWithNodes")
            );
          },
        });
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent("node-changed"));
      },
    }),
  );
}

export function useDeleteConnection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.nodes.deleteConnection.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return (
              key?.includes?.("getWorkflowWithNodes") ||
              key?.includes?.("nodes.getWorkflowWithNodes")
            );
          },
        });
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent("node-changed"));
      },
    }),
  );
}

// Workflow with nodes and connections
export function useWorkflowWithNodes(workflowId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.nodes.getWorkflowWithNodes.queryOptions({
      workflowId,
    }),
  );
}
