"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface NodeStatusState {
  [nodeId: string]: NodeStatus;
}

interface NodeStatusContextType {
  nodeStatuses: NodeStatusState;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  clearNodeStatuses: () => void;
}

const NodeStatusContext = createContext<NodeStatusContextType | undefined>(
  undefined,
);

export function NodeStatusProvider({ children }: { children: ReactNode }) {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatusState>({});

  const updateNodeStatus = (nodeId: string, status: NodeStatus) => {
    setNodeStatuses(prev => ({
      ...prev,
      [nodeId]: status,
    }));
  };

  const clearNodeStatuses = () => {
    setNodeStatuses({});
  };

  return (
    <NodeStatusContext.Provider
      value={{
        nodeStatuses,
        updateNodeStatus,
        clearNodeStatuses,
      }}
    >
      {children}
    </NodeStatusContext.Provider>
  );
}

export function useNodeStatus() {
  const context = useContext(NodeStatusContext);
  if (!context) {
    throw new Error("useNodeStatus must be used within NodeStatusProvider");
  }
  return context;
}
