"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Settings, Trash2 } from "lucide-react";
import { useDeleteNode } from "@/hooks/use-nodes";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface TriggerNodeData {
  label: string;
  description: string;
}

export default React.memo(function TriggerNode({
  data,
  selected,
  id,
}: NodeProps) {
  const nodeData = data as unknown as TriggerNodeData;
  const deleteNode = useDeleteNode();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteNode.mutate({ id: id as string });
    setShowConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <Card
      className={`min-w-[200px] scale-50 transition-all ${selected ? "ring-2 ring-green-500" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Trigger
          </Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Play className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:text-red-500"
              onClick={handleDelete}
              disabled={deleteNode.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <h3 className="font-semibold text-sm">{nodeData.label}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{nodeData.description}</p>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Node"
        description={`Are you sure you want to delete "${nodeData.label}"? This will also remove all connections.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
});
