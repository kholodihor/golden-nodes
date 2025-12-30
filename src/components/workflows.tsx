"use client";

import {
  useCreateeWorkflow,
  useSuspenseWorkflows,
} from "@/hooks/use-workflows";
import { useHasActiveSubscription } from "@/hooks/use-subscription";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import EntityHeader from "./entities/entity-header";
import EntityContainer from "./entities/entity-container";
import UpgradeModal from "./upgrade-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex- flex justify-center items-center">
      <p> {JSON.stringify(workflows.data, null, 2)}</p>
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateeWorkflow();
  const workflows = useSuspenseWorkflows();
  const { hasActiveSubscription, isLoading: isSubscriptionLoading } =
    useHasActiveSubscription();
  const upgradeModal = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    // If subscription is still loading, don't do anything
    if (isSubscriptionLoading) {
      return;
    }

    // Check if user has active subscription
    if (hasActiveSubscription) {
      // User has subscription, allow creating workflow
      createWorkflow.mutate(
        { name: "Untitled Workflow" },
        {
          onSuccess: () => {
            toast.success("Workflow created successfully");
            router.push(`/workflows/${createWorkflow.data?.id}`);
          },
          onError: error => {
            toast.error("Failed to create workflow");
            console.error("Failed to create workflow:", error);
          },
        },
      );
      return;
    }

    // User doesn't have subscription, check workflow count
    const workflowCount = workflows.data?.length || 0;

    if (workflowCount >= 1) {
      // User already has 1 workflow, show upgrade modal
      upgradeModal.openUpgradeModal();
    } else {
      // User has 0 workflows, allow creating the first one
      createWorkflow.mutate(
        { name: "Untitled Workflow" },
        {
          onSuccess: () => {
            toast.success("Workflow created successfully");
            router.push(`/workflows/${createWorkflow.data?.id}`);
          },
          onError: error => {
            toast.error("Failed to create workflow");
            console.error("Failed to create workflow:", error);
          },
        },
      );
    }
  };

  const workflowCount = workflows.data?.length || 0;
  const canCreateMore = hasActiveSubscription || workflowCount < 1;

  return (
    <>
      <EntityHeader
        title="Workflows"
        disabled={disabled || isSubscriptionLoading}
        description={`Manage your workflows ${!hasActiveSubscription ? `(${workflowCount}/1 free)` : ""}`}
        newButtonLabel="New workflow"
        onNew={handleCreate}
        isCreating={createWorkflow.isPending}
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
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
