"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Settings, Trash2 } from "lucide-react";
import { useDeleteNode } from "@/hooks/use-nodes";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default React.memo(function ActionNode({
  data,
  selected,
  id,
}: NodeProps) {
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
      className={`min-w-[200px] scale-50 transition-all ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Action
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
        <h3 className="font-semibold text-sm">{(data as any).label}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          {(data as any).description}
        </p>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Node"
        description={`Are you sure you want to delete "${(data as any).label}"? This will also remove all connections.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
});
