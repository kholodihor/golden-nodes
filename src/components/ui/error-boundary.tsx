import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { PageErrorView } from "./error-view";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRender?: (props: {
    error: Error;
    resetErrorBoundary: () => void;
  }) => React.ReactElement;
}

export const ErrorBoundary = ({
  children,
  fallbackRender = ({ error, resetErrorBoundary }) => (
    <PageErrorView error={error} onRetry={resetErrorBoundary} />
  ),
}: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary fallbackRender={fallbackRender}>
      {children}
    </ReactErrorBoundary>
  );
};
