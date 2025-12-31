"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateeWorkflow,
  useSuspenseWorkflows,
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

// Types
export interface Workflow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
const useWorkflowCreation = () => {
  const createWorkflow = useCreateeWorkflow();
  const router = useRouter();

  const createNewWorkflow = () => {
    createWorkflow.mutate(
      { name: WORKFLOW_DEFAULT_NAME },
      {
        onSuccess: data => {
          toast.success(`Workflow "${data.name}" created successfully`);
          router.push(`/workflows/${data.id}`);
        },
        onError: error => {
          toast.error("Failed to create workflow");
          console.error("Failed to create workflow:", error);
        },
      },
    );
  };

  return { createNewWorkflow, isCreating: createWorkflow.isPending };
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  const { hasActiveSubscription, isLoading: isSubscriptionLoading } =
    useHasActiveSubscription();
  const upgradeModal = useUpgradeModal();
  const { createNewWorkflow } = useWorkflowCreation();

  const workflowCount = getWorkflowCount(workflows.data);
  const canCreate = canCreateWorkflow(
    hasActiveSubscription || false,
    workflowCount,
  );
  const search = workflows.data.pagination.search;

  // Show empty state if no workflows
  if (workflowCount === 0) {
    const handleCreate = () => {
      if (isSubscriptionLoading) return;

      if (hasActiveSubscription || canCreate) {
        createNewWorkflow();
      } else {
        upgradeModal.openUpgradeModal();
      }
    };

    return (
      <WorkflowsEmpty
        onCreate={handleCreate}
        disabled={isSubscriptionLoading || !canCreate}
        search={search}
      />
    );
  }

  const handleEdit = (id: string) => {
    console.log("Edit workflow:", id);
    // TODO: Navigate to edit page
  };

  const handleDelete = (id: string) => {
    console.log("Delete workflow:", id);
    // TODO: Implement delete functionality
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
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  // Hooks
  const workflows = useSuspenseWorkflows();
  const { hasActiveSubscription, isLoading: isSubscriptionLoading } =
    useHasActiveSubscription();
  const upgradeModal = useUpgradeModal();
  const { createNewWorkflow, isCreating } = useWorkflowCreation();

  // Computed values
  const workflowCount = getWorkflowCount(workflows.data);
  const canCreate = canCreateWorkflow(
    hasActiveSubscription || false,
    workflowCount,
  );
  const description = hasActiveSubscription
    ? "Manage your workflows"
    : `Manage your workflows (${workflowCount}/${FREE_PLAN_LIMIT} free)`;

  // Event handlers
  const handleCreate = () => {
    if (isSubscriptionLoading) {
      return;
    }

    if (hasActiveSubscription || canCreate) {
      createNewWorkflow();
    } else {
      upgradeModal.openUpgradeModal();
    }
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
