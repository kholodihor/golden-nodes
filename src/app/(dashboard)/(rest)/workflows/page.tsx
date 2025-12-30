import { WorkflowsList } from "@/components/workflows";
import { prefetchWorkflows } from "@/helpers/prefetch";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const page = async () => {
  await requireAuth();
  prefetchWorkflows();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <WorkflowsList />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default page;
