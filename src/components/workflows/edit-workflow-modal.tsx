import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workflow } from "./types";

interface EditWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow;
  onUpdate: (id: string, name: string) => void;
  isUpdating?: boolean;
}

export const EditWorkflowModal = ({
  open,
  onOpenChange,
  workflow,
  onUpdate,
  isUpdating = false,
}: EditWorkflowModalProps) => {
  const [name, setName] = useState(workflow.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== workflow.name) {
      onUpdate(workflow.id, name.trim());
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setName(workflow.name);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
          <DialogDescription>
            Change the name of your workflow. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter workflow name"
                maxLength={100}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || name === workflow.name || isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
