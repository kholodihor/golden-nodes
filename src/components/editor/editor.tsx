"use client";

import React, { useCallback, useEffect } from "react";
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
import ConditionNode from "./nodes/condition-node";
import HttpRequestNode from "./nodes/http-request-node";
import EmailNode from "./nodes/email-node";
import DatabaseQueryNode from "./nodes/database-query-node";
import {
  useCreateConnection,
  useUpdateNode,
  useWorkflowWithNodes,
} from "@/hooks/use-nodes";
import { useAtom } from "jotai";
import {
  workflowDataAtom,
  convertedNodesAtom,
  convertedEdgesAtom,
  workflowIdAtom,
} from "@/store/workflow-store";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  httpRequest: HttpRequestNode,
  email: EmailNode,
  databaseQuery: DatabaseQueryNode,
};

interface EditorProps {
  workflowId?: string;
}

export default function Editor({ workflowId }: EditorProps) {
  // Fetch workflow data
  const {
    data: workflowData,
    isLoading,
    refetch,
  } = useWorkflowWithNodes(workflowId || "");

  // Update Jotai store with fetched data
  const [, setWorkflowData] = useAtom(workflowDataAtom);
  const [, setWorkflowId] = useAtom(workflowIdAtom);

  // Sync fetched data with Jotai store
  React.useEffect(() => {
    console.log("Editor: workflowData fetched:", workflowData);
    if (workflowData) {
      setWorkflowData(workflowData);
    }
    if (workflowId) {
      setWorkflowId(workflowId);
    }
  }, [workflowData, workflowId, setWorkflowData, setWorkflowId]);

  // Use Jotai atoms for React Flow data
  const [nodes] = useAtom(convertedNodesAtom);
  const [edges] = useAtom(convertedEdgesAtom);

  console.log("Editor: Jotai nodes:", nodes);
  console.log("Editor: Jotai edges:", edges);

  // Initialize React Flow state with the actual data from Jotai
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Sync Jotai atoms with React Flow state when data changes
  useEffect(() => {
    if (nodes.length > 0) {
      setFlowNodes(nodes);
    }
  }, [nodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

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

  if (isLoading) {
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
              case "condition":
                return "#a855f7";
              case "httpRequest":
                return "#8b5cf6";
              case "email":
                return "#3b82f6";
              case "databaseQuery":
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
