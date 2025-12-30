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

// Types
interface Workflow {
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

  return (
    <div className="flex flex-col justify-center items-center min-h-[200px]">
      <pre className="text-xs text-muted-foreground bg-muted p-4 rounded-lg overflow-auto max-w-full">
        {JSON.stringify(workflows.data, null, 2)}
      </pre>
    </div>
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
    if (isSubscriptionLoading) return;

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
        disabled={disabled || isSubscriptionLoading || !canCreate}
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
