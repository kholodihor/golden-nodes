"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, SquareIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { WorkflowExecution } from "@/types";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import superjson from "superjson";

// Create a direct client for polling
const createDirectClient = () => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
};

interface ExecuteWorkflowButtonProps {
  workflowId: string;
  disabled?: boolean;
}

export function ExecuteWorkflowButton({
  workflowId,
  disabled = false,
}: ExecuteWorkflowButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );
  const trpc = useTRPC();

  const executeMutation = useMutation(
    trpc.executions.execute.mutationOptions({
      onSuccess: (data: any) => {
        const execution = data as WorkflowExecution;
        setIsExecuting(true);
        setCurrentExecutionId(execution.id);
        toast.success(`Workflow execution started: ${execution.id}`);

        // Poll for execution status
        const checkStatus = async () => {
          try {
            const client = createDirectClient();
            const status = await client.executions.getById.query({
              id: execution.id,
            });
            if (status.status === "SUCCESS") {
              setIsExecuting(false);
              setCurrentExecutionId(null);
              toast.success("Workflow completed successfully!");
            } else if (status.status === "FAILED") {
              setIsExecuting(false);
              setCurrentExecutionId(null);
              toast.error(`Workflow failed: ${status.error}`);
            } else if (status.status === "CANCELLED") {
              setIsExecuting(false);
              setCurrentExecutionId(null);
              toast.info("Workflow was cancelled");
            } else {
              // Still running, check again in 2 seconds
              setTimeout(checkStatus, 2000);
            }
          } catch (_error) {
            setIsExecuting(false);
            setCurrentExecutionId(null);
            toast.error("Failed to check execution status");
          }
        };

        checkStatus();
      },
      onError: (error: any) => {
        toast.error(`Failed to start workflow: ${error.message}`);
      },
    }),
  );

  const cancelMutation = useMutation(
    trpc.executions.cancel.mutationOptions({
      onSuccess: () => {
        setIsExecuting(false);
        setCurrentExecutionId(null);
        toast.info("Workflow execution cancelled");
      },
      onError: (error: any) => {
        toast.error(`Failed to cancel workflow: ${error.message}`);
      },
    }),
  );

  const handleExecute = () => {
    executeMutation.mutate({
      workflowId,
      inputData: {
        timestamp: new Date().toISOString(),
        triggeredBy: "manual",
      },
    });
  };

  const handleCancel = () => {
    if (currentExecutionId) {
      cancelMutation.mutate({
        id: currentExecutionId,
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExecute}
        disabled={disabled || isExecuting || executeMutation.isPending}
        size="sm"
      >
        <PlayIcon className="w-4 h-4 mr-2" />
        {executeMutation.isPending ? "Starting..." : "Execute"}
      </Button>

      {isExecuting && (
        <Button
          onClick={handleCancel}
          disabled={cancelMutation.isPending}
          variant="outline"
          size="sm"
        >
          <SquareIcon className="w-4 h-4 mr-2" />
          {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
        </Button>
      )}
    </div>
  );
}
