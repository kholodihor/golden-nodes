import { Spinner } from "./spinner";
import { WorkflowsLoadingSkeleton } from "./loading-skeleton";

export const LoadingView = ({
  variant = "spinner",
  message = "Loading...",
}: {
  variant?: "spinner" | "skeleton" | "centered";
  message?: string;
}) => {
  if (variant === "skeleton") {
    return <WorkflowsLoadingSkeleton />;
  }

  if (variant === "centered") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner className="size-8" />
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Spinner />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};

export const PageLoadingView = () => (
  <LoadingView variant="centered" message="Loading workflows..." />
);

export const InlineLoadingView = () => (
  <LoadingView variant="spinner" message="Loading..." />
);
