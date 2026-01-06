"use client";

import dynamic from "next/dynamic";
import { PageLoadingView } from "@/components/ui/loading-view";

const WorkflowsPage = dynamic(() => import("./workflows-page-client"), {
  loading: () => <PageLoadingView />,
  ssr: false,
});

export function ClientOnlyWorkflows() {
  return <WorkflowsPage />;
}
