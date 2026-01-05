import { atom } from "jotai";
import { Node, Edge } from "@xyflow/react";
import { WorkflowData, WorkflowNode, WorkflowConnection } from "@/types";

// Workflow ID atom
export const workflowIdAtom = atom<string | null>(null);

// Raw workflow data from database with proper typing
export const workflowDataAtom = atom<WorkflowData | null>(null);

// React Flow nodes atom
export const flowNodesAtom = atom<Node[]>([]);

// React Flow edges atom
export const flowEdgesAtom = atom<Edge[]>([]);

// Loading state
export const isLoadingAtom = atom<boolean>(true);

// Derived atom for converting database nodes to React Flow format
export const convertedNodesAtom = atom(get => {
  const workflowData = get(workflowDataAtom);
  console.log("Store: workflowData in convertedNodesAtom:", workflowData);

  if (!workflowData?.nodes) {
    console.log("Store: No nodes in workflowData, returning empty array");
    return [];
  }

  const convertedNodes = workflowData.nodes.map((dbNode: any) => {
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
  });

  console.log("Store: Converted nodes:", convertedNodes);
  return convertedNodes;
});

// Derived atom for converting database connections to React Flow format
export const convertedEdgesAtom = atom(get => {
  const workflowData = get(workflowDataAtom);
  if (!workflowData?.connections) return [];

  return workflowData.connections.map((dbConnection: any) => ({
    id: dbConnection.id,
    source: dbConnection.sourceNodeId,
    target: dbConnection.targetNodeId,
    sourceHandle: dbConnection.sourceHandle,
    targetHandle: dbConnection.targetHandle,
    animated: true,
  }));
});

// Action to update workflow data
export const updateWorkflowDataAtom = atom(null, (get, set, update: any) => {
  const currentData = get(workflowDataAtom);
  if (currentData) {
    set(workflowDataAtom, { ...currentData, ...update });
  }
});

// Action to set loading state
export const setLoadingAtom = atom(null, (get, set, loading: boolean) => {
  set(isLoadingAtom, loading);
});
