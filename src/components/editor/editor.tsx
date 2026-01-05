"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  NodeTypes,
} from "@xyflow/react";

import CustomNode from "./nodes/custom-node";
import TriggerNode from "./nodes/trigger-node";
import ActionNode from "./nodes/action-node";
import { useCreateConnection, useUpdateNode } from "@/hooks/use-nodes";
import { useAtom } from "jotai";
import { convertedNodesAtom, convertedEdgesAtom } from "@/store/workflow-store";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  trigger: TriggerNode,
  action: ActionNode,
};

interface EditorProps {
  workflowId?: string;
}

export default function Editor({ workflowId }: EditorProps) {
  // Use Jotai atoms directly - no more complex state management
  const [nodes] = useAtom(convertedNodesAtom);
  const [edges] = useAtom(convertedEdgesAtom);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  const createConnection = useCreateConnection();
  const updateNode = useUpdateNode();

  const onConnect = useCallback(
    (params: Connection) => {
      // Create connection in database
      createConnection.mutate({
        workflowId: workflowId!,
        sourceNodeId: params.source!,
        targetNodeId: params.target!,
        sourceHandle: params.sourceHandle || "source",
        targetHandle: params.targetHandle || "target",
      });
    },
    [createConnection, workflowId],
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Save node position to database
      updateNode.mutate({
        id: node.id,
        position: { x: node.position.x, y: node.position.y },
      });
    },
    [updateNode],
  );

  if (!flowNodes.length) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-zinc-50 dark:bg-zinc-900"
      >
        <Controls />
        <MiniMap
          nodeColor={node => {
            switch (node.type) {
              case "trigger":
                return "#10b981";
              case "action":
                return "#3b82f6";
              default:
                return "#6b7280";
            }
          }}
          className="bg-white dark:bg-zinc-800"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
