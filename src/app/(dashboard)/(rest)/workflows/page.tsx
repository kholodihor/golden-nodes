import { WorkflowsContainer, WorkflowsList } from "@/components/workflows";
import { requireAuth } from "@/utils/auth";
import { Suspense } from "react";
import { PageLoadingView } from "@/components/ui/loading-view";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";

const page = async () => {
  await requireAuth();

  return (
    <WorkflowsContainer>
      <ClientErrorBoundary>
        <Suspense fallback={<PageLoadingView />}>
          <WorkflowsList />
        </Suspense>
      </ClientErrorBoundary>
    </WorkflowsContainer>
  );
};

export default page;
