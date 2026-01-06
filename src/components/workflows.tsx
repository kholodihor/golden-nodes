"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateeWorkflow,
  useSuspenseWorkflows,
  useDeleteWorkflow,
} from "@/hooks/use-workflows";
import { useHasActiveSubscription } from "@/hooks/use-subscription";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import EntityHeader from "./entities/entity-header";
import EntityContainer from "./entities/entity-container";
import UpgradeModal from "./upgrade-modal";
import { SearchInput } from "./entities/search-input";
import { PaginationControls } from "./entities/pagination-controls";
import { WorkflowsEmpty } from "./ui/workflows-empty";
import { WorkflowGrid } from "./workflows/workflow-card";
import { CreateWorkflowModal } from "./workflows/create-workflow-modal";

// Types
export interface Workflow {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface WorkflowsData {
  workflows: Workflow[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    search: string;
  };
}

// Constants
const WORKFLOW_DEFAULT_NAME = "Untitled Workflow";
const FREE_PLAN_LIMIT = 1;

// Helper functions
const getWorkflowCount = (workflowsData: WorkflowsData) =>
  workflowsData.workflows.length;
const canCreateWorkflow = (hasSubscription: boolean, workflowCount: number) =>
  hasSubscription || workflowCount < FREE_PLAN_LIMIT;

// Custom hooks
export const useWorkflowCreation = () => {
  const createWorkflow = useCreateeWorkflow();
  const router = useRouter();

  const createNewWorkflow = ({ name }: { name: string }) => {
    createWorkflow.mutate({ name });
  };

  return { createNewWorkflow, isCreating: createWorkflow.isPending };
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  const { hasActiveSubscription, isLoading: isSubscriptionLoading } =
    useHasActiveSubscription();
  const upgradeModal = useUpgradeModal();
  const { createNewWorkflow } = useWorkflowCreation();
  const deleteWorkflow = useDeleteWorkflow();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const workflowCount = getWorkflowCount(workflows.data);
  const canCreate = canCreateWorkflow(
    hasActiveSubscription || false,
    workflowCount,
  );

  // Show empty state if no workflows
  if (workflowCount === 0) {
    const handleCreate = () => {
      if (isSubscriptionLoading) return;

      if (hasActiveSubscription || canCreate) {
        setIsCreateModalOpen(true);
      } else {
        upgradeModal.openUpgradeModal();
      }
    };

    return (
      <>
        <WorkflowsEmpty
          onCreate={handleCreate}
          disabled={isSubscriptionLoading || !canCreate}
          search=""
        />
        <CreateWorkflowModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </>
    );
  }

  const handleEdit = (id: string) => {
    console.log("Edit workflow:", id);
    // TODO: Navigate to edit page
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteWorkflow.mutate(
      { id },
      {
        onSettled: () => {
          setDeletingId(null);
        },
      },
    );
  };

  const handleDuplicate = (id: string) => {
    console.log("Duplicate workflow:", id);
    // TODO: Implement duplicate functionality
  };

  const handleRun = (id: string) => {
    console.log("Run workflow:", id);
    // TODO: Implement run functionality
  };

  return (
    <WorkflowGrid
      workflows={workflows.data.workflows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onRun={handleRun}
      loadingWorkflows={deletingId ? [deletingId] : []}
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const { hasActiveSubscription, isLoading: isSubscriptionLoading } =
    useHasActiveSubscription();
  const upgradeModal = useUpgradeModal();
  const { isCreating } = useWorkflowCreation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const description = "Manage your workflows";

  const handleCreate = () => {
    if (isSubscriptionLoading) {
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <EntityHeader
        title="Workflows"
        disabled={disabled || isSubscriptionLoading}
        description={description}
        newButtonLabel="New workflow"
        onNew={handleCreate}
        isCreating={isCreating}
      />

      <CreateWorkflowModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.closeUpgradeModal}
        onUpgrade={upgradeModal.handleUpgrade}
        currentPlan={upgradeModal.currentPlan}
        features={upgradeModal.features}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<SearchInput />}
      pagination={<PaginationControls />}
    >
      {children}
    </EntityContainer>
  );
};
