"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { PageErrorView } from "./error-view";

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
}

export const ClientErrorBoundary = ({ children }: ClientErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <PageErrorView error={error} onRetry={resetErrorBoundary} />
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
};
