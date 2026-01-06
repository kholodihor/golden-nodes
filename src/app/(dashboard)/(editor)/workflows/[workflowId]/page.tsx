import { requireAuth } from "@/utils/auth";
import { Suspense } from "react";
import { PageLoadingView } from "@/components/ui/loading-view";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";
import { WorkflowEditorClient } from "@/components/workflow/workflow-editor-client";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  await requireAuth();
  const { workflowId } = await params;

  return (
    <ClientErrorBoundary>
      <Suspense fallback={<PageLoadingView />}>
        <WorkflowEditorClient workflowId={workflowId} />
      </Suspense>
    </ClientErrorBoundary>
  );
};

export default page;
