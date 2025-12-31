import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Play, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Workflow } from "@/components/workflows";

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRun?: (id: string) => void;
  isRunning?: boolean;
}

export const WorkflowCard = ({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  onRun,
  isRunning = false,
}: WorkflowCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(workflow.createdAt), {
    addSuffix: true,
  });

  const handleAction = (action: () => void) => {
    action();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {workflow.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Created {timeAgo}
              </span>
              <Badge variant="secondary" className="text-xs">
                Draft
              </Badge>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleAction(() => onEdit?.(workflow.id))}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(() => onDuplicate?.(workflow.id))}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction(() => onDelete?.(workflow.id))}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Ready to run</span>
          </div>
          <Button
            size="sm"
            onClick={() => handleAction(() => onRun?.(workflow.id))}
            disabled={isRunning}
            className="gap-2"
          >
            <Play className="h-3 w-3" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>

        {/* Workflow preview/stats */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium">0</div>
              <div className="text-xs text-muted-foreground">Steps</div>
            </div>
            <div>
              <div className="text-sm font-medium">0</div>
              <div className="text-xs text-muted-foreground">Runs</div>
            </div>
            <div>
              <div className="text-sm font-medium">0s</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WorkflowGridProps {
  workflows: Workflow[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRun?: (id: string) => void;
  loadingWorkflows?: string[];
}

export const WorkflowGrid = ({
  workflows,
  onEdit,
  onDelete,
  onDuplicate,
  onRun,
  loadingWorkflows = [],
}: WorkflowGridProps) => {
  if (workflows.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map(workflow => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onRun={onRun}
          isRunning={loadingWorkflows.includes(workflow.id)}
        />
      ))}
    </div>
  );
};
