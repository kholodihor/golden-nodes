import { FileText, Search } from "lucide-react";
import { Button } from "./button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "./empty";

interface BaseEmptyProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
}

export const BaseEmpty = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: BaseEmptyProps) => {
  return (
    <Empty className={`min-h-[300px] ${className || ""}`}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {(action || secondaryAction) && (
        <EmptyContent>
          <div className="flex gap-2">
            {action && (
              <Button
                onClick={action.onClick}
                disabled={action.disabled}
                variant={action.variant || "default"}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
};

// Workflows-specific empty states
interface WorkflowsEmptyProps {
  onCreate?: () => void;
  disabled?: boolean;
  search?: string;
}

export const WorkflowsEmpty = ({
  onCreate,
  disabled = false,
  search = "",
}: WorkflowsEmptyProps) => {
  const isSearchEmpty = search.trim().length > 0;

  if (isSearchEmpty) {
    return (
      <BaseEmpty
        title="No workflows found"
        description={`We couldn't find any workflows matching "${search}". Try adjusting your search terms.`}
        icon={<Search />}
      />
    );
  }

  return (
    <BaseEmpty
      title="No workflows yet"
      description="Create your first workflow to get started with automation and streamline your processes."
      icon={<FileText />}
      action={{
        label: "Create your first workflow",
        onClick: onCreate || (() => {}),
        disabled,
      }}
    />
  );
};

// Generic empty states for common use cases
interface GenericEmptyProps {
  resource: string;
  onCreate?: () => void;
  disabled?: boolean;
  search?: string;
  customMessage?: string;
}

export const GenericEmpty = ({
  resource,
  onCreate,
  disabled = false,
  search = "",
  customMessage,
}: GenericEmptyProps) => {
  const isSearchEmpty = search.trim().length > 0;
  const resourceName = resource.toLowerCase();

  if (isSearchEmpty) {
    return (
      <BaseEmpty
        title={`No ${resource} found`}
        description={`We couldn't find any ${resourceName} matching "${search}". Try adjusting your search terms.`}
        icon={<Search />}
      />
    );
  }

  return (
    <BaseEmpty
      title={`No ${resource} yet`}
      description={
        customMessage || `Create your first ${resourceName} to get started.`
      }
      icon={<FileText />}
      action={
        onCreate
          ? {
              label: `Create your first ${resourceName}`,
              onClick: onCreate,
              disabled,
            }
          : undefined
      }
    />
  );
};

// Specialized empty states
export const WorkflowsEmptyState = ({
  onCreate,
  disabled,
}: {
  onCreate?: () => void;
  disabled?: boolean;
}) => <WorkflowsEmpty onCreate={onCreate} disabled={disabled} />;

export const WorkflowsSearchEmpty = ({ search }: { search: string }) => (
  <WorkflowsEmpty search={search} />
);
