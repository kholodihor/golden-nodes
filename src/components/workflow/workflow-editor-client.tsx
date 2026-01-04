"use client";
import { useState } from "react";
import { useWorkflow, useUpdateWorkflow } from "@/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import { Workflow } from "@/components/workflows/types";
import { EditWorkflowModal } from "@/components/workflows/edit-workflow-modal";
import EntityContainer from "@/components/entities/entity-container";
import Editor from "@/components/editor/editor";
import NodePalette from "@/components/editor/node-palette";
import WorkflowProvider from "@/components/editor/workflow-provider";
import { AlertCircle, RefreshCw, Home, Edit, Save } from "lucide-react";

interface WorkflowEditorClientProps {
  workflowId: string;
}

export function WorkflowEditorClient({
  workflowId,
}: WorkflowEditorClientProps) {
  const { data: workflow, isLoading, error, refetch } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    </EntityContainer>
  );
}

function WorkflowHeader({
  workflow,
  onEdit,
  isUpdating,
}: {
  workflow: Workflow;
  onEdit?: () => void;
  isUpdating?: boolean;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">{workflow.name}</h1>
        <p className="text-sm text-gray-500">Edit and manage your workflow</p>
      </div>
      <div className="flex gap-2">
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
