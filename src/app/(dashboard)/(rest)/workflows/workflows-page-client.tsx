"use client";

import { WorkflowsList, WorkflowsContainer } from "@/components/workflows";
import { Suspense } from "react";
import { PageLoadingView } from "@/components/ui/loading-view";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";

export default function WorkflowsPageClient() {
  return (
    <ClientErrorBoundary>
      <Suspense fallback={<PageLoadingView />}>
        <WorkflowsContainer>
          <WorkflowsList />
        </WorkflowsContainer>
      </Suspense>
    </ClientErrorBoundary>
  );
}
