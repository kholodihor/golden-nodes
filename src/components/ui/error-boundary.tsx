import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { PageErrorView } from "./error-view";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}

export const ErrorBoundary = ({
  children,
  fallback = ({ error, resetErrorBoundary }) => (
    <PageErrorView error={error} onRetry={resetErrorBoundary} />
  ),
}: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary fallback={fallback}>{children}</ReactErrorBoundary>
  );
};
