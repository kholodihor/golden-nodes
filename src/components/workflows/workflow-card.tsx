import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Workflow } from "./types";
import { ExecuteWorkflowButton } from "@/components/workflow/execute-workflow-button";

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isRunning?: boolean;
}

export const WorkflowCard = ({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  isRunning = false,
}: WorkflowCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(workflow.createdAt), {
    addSuffix: true,
  });

  const handleAction = (action: () => void) => {
    action();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteDialogOpen(false);
    if (onDelete) {
      onDelete(workflow.id);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 max-w-[500px]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {workflow.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                <Badge variant="secondary">Draft</Badge>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  onClick={handleDelete}
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
              <span className="text-xs text-muted-foreground">
                Ready to run
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/workflows/${workflow.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  Open
                </Button>
              </Link>
              <ExecuteWorkflowButton
                workflowId={workflow.id}
                disabled={isRunning}
              />
            </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete `${workflow.name}`? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface WorkflowGridProps {
  workflows: Workflow[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  loadingWorkflows?: string[];
}

export const WorkflowGrid = ({
  workflows,
  onEdit,
  onDelete,
  onDuplicate,
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
          isRunning={loadingWorkflows.includes(workflow.id)}
        />
      ))}
    </div>
  );
};
