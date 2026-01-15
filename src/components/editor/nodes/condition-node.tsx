"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";
import { useDeleteNode } from "@/hooks/use-nodes";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import NodeEditor from "@/components/editor/node-editor";
import { ReactFlowNodeData } from "@/types";

type ConditionNodeData = ReactFlowNodeData;

export default function ConditionNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;
  const deleteNode = useDeleteNode();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showEditor, setShowEditor] = React.useState(false);

  // Get status indicator
  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditor(true);
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
      className={`min-w-[300px]  scale-40 transition-all ${selected ? "ring-2 ring-purple-500" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-purple-500 hover:bg-purple-600"
            >
              Condition
            </Badge>
            {getStatusIndicator(nodeData.status)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 hover:bg-purple-100"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-red-100"
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
        {/* Show condition preview */}
        {(data as any).condition && (
          <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700">
                {(data as any).condition} {(data as any).operator}{" "}
                {(data as any).value}
              </span>
            </div>
          </div>
        )}
        {(data as any).expression && (
          <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700 font-mono">
                {(data as any).expression}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 bg-purple-500 border-2 border-white"
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
      <NodeEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        nodeId={id as string}
        nodeData={data as any}
        nodeType="CONDITION"
      />
    </Card>
  );
}
