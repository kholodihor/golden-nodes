import { WorkflowsContainer, WorkflowsList } from "@/components/workflows";
import { prefetchWorkflows } from "@/helpers/prefetch";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth";
import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { workflowsParamsLoader } from "@/utils/params";
import { PageLoadingView } from "@/components/ui/loading-view";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);

  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ClientErrorBoundary>
          <Suspense fallback={<PageLoadingView />}>
            <WorkflowsList />
          </Suspense>
        </ClientErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default page;
