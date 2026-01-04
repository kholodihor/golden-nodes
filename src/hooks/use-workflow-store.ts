"use client";

import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  useWorkflowWithNodes,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCreateConnection,
  useDeleteConnection,
} from "./use-nodes";
import {
  workflowIdAtom,
  workflowDataAtom,
  flowNodesAtom,
  flowEdgesAtom,
  convertedNodesAtom,
  convertedEdgesAtom,
  isLoadingAtom,
  setLoadingAtom,
  updateWorkflowDataAtom,
} from "@/store/workflow-store";

export function useWorkflowStore(workflowId: string) {
  // Set workflow ID
  const setWorkflowId = useSetAtom(workflowIdAtom);

  // Get workflow data from tRPC
  const {
    data: workflowData,
    isLoading,
    refetch,
  } = useWorkflowWithNodes(workflowId);

  // Store atoms
  const [flowNodes, setFlowNodes] = useAtom(flowNodesAtom);
  const [flowEdges, setFlowEdges] = useAtom(flowEdgesAtom);
  const [convertedNodes] = useAtom(convertedNodesAtom);
  const [convertedEdges] = useAtom(convertedEdgesAtom);
  const setLoading = useSetAtom(isLoadingAtom);
  const updateWorkflowData = useSetAtom(updateWorkflowDataAtom);

  // Mutations
  const createNode = useCreateNode();
  const updateNode = useUpdateNode();
  const deleteNode = useDeleteNode();
  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();

  // Update workflow data when tRPC data changes
  useEffect(() => {
    if (workflowData) {
      updateWorkflowData(workflowData);
      setFlowNodes(convertedNodes);
      setFlowEdges(convertedEdges);
    }
    setLoading(isLoading);
  }, [workflowData, isLoading, convertedNodes, convertedEdges]);

  // Set workflow ID
  useEffect(() => {
    setWorkflowId(workflowId);
  }, [workflowId]);

  return {
    // State
    workflowData,
    flowNodes,
    flowEdges,
    isLoading,

    // Actions
    refetch,
    createNode,
    updateNode,
    deleteNode,
    createConnection,
    deleteConnection,

    // Direct setters for React Flow
    setFlowNodes,
    setFlowEdges,
  };
}
