import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

interface ErrorViewProps {
  error?: Error | { message?: string };
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showHome?: boolean;
  variant?: "page" | "card" | "inline";
}

export const ErrorView = ({
  error,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showRetry = true,
  onRetry,
  showHome = true,
  variant = "page",
}: ErrorViewProps) => {
  const errorMessage = error?.message || description;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/workflows";
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center space-x-2 text-destructive">
        <AlertTriangle className="size-4" />
        <span className="text-sm">{errorMessage}</span>
        {showRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="h-auto p-1 text-destructive hover:text-destructive"
          >
            <RefreshCw className="size-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center space-x-2">
          {showRetry && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button onClick={handleGoHome} variant="ghost">
              <Home className="mr-2 size-4" />
              Go Home
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="max-w-md border-destructive/20 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center space-x-2">
          {showRetry && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button onClick={handleGoHome} variant="ghost">
              <Home className="mr-2 size-4" />
              Go Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const PageErrorView = ({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}) => (
  <ErrorView
    error={error}
    title="Failed to load workflows"
    description="We couldn't load your workflows. Please check your connection and try again."
    onRetry={onRetry}
    variant="page"
  />
);

export const CardErrorView = ({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}) => (
  <ErrorView
    error={error}
    title="Error"
    description="Something went wrong. Please try again."
    onRetry={onRetry}
    variant="card"
  />
);

export const InlineErrorView = ({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}) => <ErrorView error={error} onRetry={onRetry} variant="inline" />;
