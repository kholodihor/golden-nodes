"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from "@xyflow/react";

import CustomNode from "./nodes/custom-node";
import TriggerNode from "./nodes/trigger-node";
import ActionNode from "./nodes/action-node";
import {
  useWorkflowWithNodes,
  useCreateConnection,
  useUpdateNode,
} from "@/hooks/use-nodes";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  trigger: TriggerNode,
  action: ActionNode,
};

// Helper to convert database node to React Flow node
const dbNodeToFlowNode = (dbNode: any): Node => {
  const nodeType =
    dbNode.type === "START"
      ? "trigger"
      : dbNode.type === "ACTION"
        ? "action"
        : "custom";

  return {
    id: dbNode.id,
    type: nodeType,
    position: dbNode.position as { x: number; y: number },
    data: dbNode.data as { label: string; description: string },
  };
};

// Helper to convert database connection to React Flow edge
const dbConnectionToFlowEdge = (dbConnection: any): Edge => {
  return {
    id: dbConnection.id,
    source: dbConnection.sourceNodeId,
    target: dbConnection.targetNodeId,
    sourceHandle: dbConnection.sourceHandle,
    targetHandle: dbConnection.targetHandle,
    animated: true,
  };
};

interface EditorProps {
  workflowId?: string;
}

export default function Editor({ workflowId }: EditorProps) {
  const {
    data: workflowData,
    isLoading,
    refetch,
  } = useWorkflowWithNodes(workflowId || "");
  const createConnection = useCreateConnection();
  const updateNode = useUpdateNode();

  // Convert database data to React Flow format
  const nodes = useMemo(
    () => workflowData?.nodes?.map(dbNodeToFlowNode) || [],
    [workflowData?.nodes],
  );
  const edges = useMemo(
    () => workflowData?.connections?.map(dbConnectionToFlowEdge) || [],
    [workflowData?.connections],
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Update React Flow state when database data changes (but preserve viewport)
  useEffect(() => {
    if (isInitialLoad) {
      // Only set nodes/edges on initial load
      setFlowNodes(nodes);
      setFlowEdges(edges);
      // Use setTimeout to avoid synchronous setState
      setTimeout(() => setIsInitialLoad(false), 0);
    } else {
      // For subsequent updates, add/remove nodes without resetting viewport
      const currentIds = new Set(flowNodes.map(n => n.id));
      const newIds = new Set(nodes.map(n => n.id));

      // Find nodes to add and remove
      const nodesToAdd = nodes.filter(n => !currentIds.has(n.id));
      const nodesToRemove = flowNodes.filter(n => !newIds.has(n.id));

      // Update nodes by adding/removing individual nodes
      if (nodesToAdd.length > 0 || nodesToRemove.length > 0) {
        const updatedNodes = [
          ...flowNodes.filter(n => !nodesToRemove.find(r => r.id === n.id)),
          ...nodesToAdd,
        ];
        setFlowNodes(updatedNodes);
      }

      // For edges, be more careful - only update database edges, preserve user-created ones
      const dbEdgeIds = new Set(edges.map(e => e.id));
      const currentDbEdges = flowEdges.filter(e => dbEdgeIds.has(e.id));
      const userEdges = flowEdges.filter(e => !dbEdgeIds.has(e.id));

      // Update only database edges
      const edgesToAdd = edges.filter(
        e => !currentDbEdges.find(r => r.id === e.id),
      );
      const edgesToRemove = currentDbEdges.filter(
        e => !edges.find(r => r.id === e.id),
      );

      if (edgesToAdd.length > 0 || edgesToRemove.length > 0) {
        const updatedEdges = [
          ...userEdges, // Keep user-created edges (including temporary ones)
          ...currentDbEdges.filter(
            e => !edgesToRemove.find(r => r.id === e.id),
          ),
          ...edgesToAdd,
        ];
        setFlowEdges(updatedEdges);
      }
    }
  }, [
    nodes,
    edges,
    flowNodes,
    flowEdges,
    setFlowNodes,
    setFlowEdges,
    isInitialLoad,
  ]);

  // Listen for node creation events to trigger refetch
  useEffect(() => {
    const handleNodeChange = () => {
      refetch();
    };

    // Custom event listener for node changes
    window.addEventListener("node-changed", handleNodeChange);

    return () => {
      window.removeEventListener("node-changed", handleNodeChange);
    };
  }, [refetch]);

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
