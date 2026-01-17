"use client";
import { useState, useEffect, useMemo } from "react";
import { useWorkflow, useUpdateWorkflow } from "@/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import { Workflow } from "@/components/workflows/types";
import { EditWorkflowModal } from "@/components/workflows/edit-workflow-modal";
import { NodeStatusDisplay } from "@/components/node-status-display";
import {
  NodeStatusProvider,
  useNodeStatus,
} from "@/contexts/node-status-context";
import { useInngestSubscription } from "@/inngest/realtime";
import { httpRequestChannel } from "@/inngest/realtime";
import EntityContainer from "@/components/entities/entity-container";
import Editor from "@/components/editor/editor";
import NodePalette from "@/components/editor/node-palette";
import WorkflowProvider from "@/components/editor/workflow-provider";
import {
  AlertCircle,
  RefreshCw,
  Home,
  Edit,
  Save,
  PlayIcon,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface WorkflowEditorClientProps {
  workflowId: string;
}

// Wrapper component that provides the context
export function WorkflowEditorClientWithProvider({
  workflowId,
}: WorkflowEditorClientProps) {
  return (
    <NodeStatusProvider>
      <WorkflowEditorClient workflowId={workflowId} />
    </NodeStatusProvider>
  );
}

export function WorkflowEditorClient({
  workflowId,
}: WorkflowEditorClientProps) {
  const { data: workflow, isLoading, error, refetch } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );
  const trpc = useTRPC();
  const { updateNodeStatus } = useNodeStatus();

  // Memoize the token to prevent infinite re-renders
  const subscriptionToken = useMemo(
    () => ({
      channel: httpRequestChannel,
      topics: ["node.status"],
    }),
    [],
  );

  // Listen to real-time events and update node statuses
  const { data: realtimeEvents } = useInngestSubscription({
    token: subscriptionToken,
  });

  const executeMutation = useMutation(
    trpc.executions.execute.mutationOptions({
      onSuccess: (data: any) => {
        const execution = data;
        setCurrentExecutionId(execution.id);
        toast.success(`Workflow execution started: ${execution.id}`);
      },
      onError: (error: any) => {
        toast.error(`Failed to start workflow: ${error.message}`);
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

  // Update node statuses based on real-time events
  useEffect(() => {
    if (!currentExecutionId) return;

    const relevantEvents = realtimeEvents.filter(
      (event: any) => event.data.executionId === currentExecutionId,
    );

    relevantEvents.forEach((event: any) => {
      const status = event.data.message?.includes("successfully")
        ? "success"
        : event.data.message?.includes("error") ||
            event.data.message?.includes("failed")
          ? "error"
          : "running";

      updateNodeStatus(event.data.nodeId, status);
    });
  }, [currentExecutionId, realtimeEvents, updateNodeStatus]);

  // Clear statuses when execution changes
  useEffect(() => {
    if (currentExecutionId) {
      // Clear previous statuses when starting new execution
      const relevantEvents = realtimeEvents.filter(
        (event: any) => event.data.executionId === currentExecutionId,
      );

      // Set all nodes to running when execution starts
      if (relevantEvents.length === 0) {
        // This is a new execution, set nodes to running based on workflow data
        if (workflow?.nodes) {
          workflow.nodes.forEach(node => {
            if (node.type === "START") {
              updateNodeStatus(node.id, "running");
            }
          });
        }
      }
    }
  }, [currentExecutionId, workflow, updateNodeStatus]);

  const handleUpdateWorkflow = (id: string, name: string) => {
    updateWorkflow.mutate({ id, name });
    setIsEditModalOpen(false);
  };

  const handleGoHome = () => {
    window.location.href = "/workflows";
  };

  if (isLoading) {
    return (
      <EntityContainer>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading workflow...
          </div>
        </div>
      </EntityContainer>
    );
  }

  if (error || !workflow) {
    return (
      <EntityContainer>
        <div className="flex items-center justify-center h-64">
          <div className="max-w-md w-full">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-red-200 bg-red-50">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to load workflow
              </h3>
              <p className="text-sm text-red-600 mb-6">
                {error?.message ||
                  "The workflow could not be found or you don't have permission to access it."}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </EntityContainer>
    );
  }

  return (
    <EntityContainer
      header={
        <WorkflowHeader
          workflow={workflow}
          onEdit={() => setIsEditModalOpen(true)}
          isUpdating={updateWorkflow.isPending}
          onExecute={handleExecute}
          executeMutation={executeMutation}
        />
      }
    >
      <EditWorkflowModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        workflow={workflow}
        onUpdate={handleUpdateWorkflow}
        isUpdating={updateWorkflow.isPending}
      />
      <div className="mt-6 flex gap-4">
        <WorkflowProvider>
          <div className="flex-1">
            <Editor workflowId={workflowId} />
          </div>
          <div className="w-64">
            <NodePalette workflowId={workflowId} />
          </div>
        </WorkflowProvider>
      </div>

      {/* Real-time Node Status Panel */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Node Status</h3>
        <NodeStatusDisplay executionId={currentExecutionId || ""} />
        <p className="text-sm text-gray-500 mt-2">
          {currentExecutionId
            ? `Monitoring execution: ${currentExecutionId}`
            : "Execute the workflow to see real-time node status updates"}
        </p>
      </div>
    </EntityContainer>
  );
}

function WorkflowHeader({
  workflow,
  onEdit,
  isUpdating,
  onExecute,
  executeMutation,
}: {
  workflow: Workflow;
  onEdit?: () => void;
  isUpdating?: boolean;
  onExecute?: () => void;
  executeMutation?: any;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">{workflow.name}</h1>
        <p className="text-sm text-gray-500">Edit and manage your workflow</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onExecute}
          disabled={executeMutation?.isPending}
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          {executeMutation?.isPending ? "Starting..." : "Execute"}
        </Button>
        <Button size="sm" onClick={onEdit} disabled={isUpdating}>
          <Edit className="h-4 w-4 mr-2" />
          {isUpdating ? "Saving..." : "Edit Title"}
        </Button>
        <Button size="sm" variant="default">
          <Save className="h-4 w-4 mr-2" />
          Save Workflow
        </Button>
      </div>
    </div>
  );
}
