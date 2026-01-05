import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { workflowDataAtom } from "@/store/workflow-store";

// Nodes
export function useCreateNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const setWorkflowData = useSetAtom(workflowDataAtom);

  return useMutation(
    trpc.nodes.create.mutationOptions({
      onSuccess: newNode => {
        // Optimistically update Jotai store instead of invalidating
        setWorkflowData(current => {
          if (!current) return current;
          return {
            ...current,
            nodes: [...(current.nodes || []), newNode],
          };
        });

        // Invalidate queries in background (non-blocking)
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

export function useUpdateNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const setWorkflowData = useSetAtom(workflowDataAtom);

  return useMutation(
    trpc.nodes.update.mutationOptions({
      onSuccess: updatedNode => {
        // Optimistically update Jotai store
        setWorkflowData((current: any) => {
          if (!current) return current;
          return {
            ...current,
            nodes:
              current.nodes?.map((node: any) =>
                node.id === updatedNode.id ? updatedNode : node,
              ) || [],
          };
        });

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

export function useDeleteNode() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const setWorkflowData = useSetAtom(workflowDataAtom);

  return useMutation(
    trpc.nodes.delete.mutationOptions({
      onSuccess: (_, variables) => {
        // Optimistically update Jotai store
        setWorkflowData((current: any) => {
          if (!current) return current;
          return {
            ...current,
            nodes:
              current.nodes?.filter((node: any) => node.id !== variables.id) ||
              [],
          };
        });

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
