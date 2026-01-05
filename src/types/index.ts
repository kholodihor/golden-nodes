// Workflow and Node Type Definitions

// Type definitions matching database schema
export type NodeType = "ACTION" | "CONDITION" | "START" | "END";

// Use a flexible type that matches what Prisma returns
export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  data: any; // Prisma JsonValue becomes 'any' in runtime
  position: any; // Position is also stored as JSON in DB
  workflowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
  sourceOutput: string;
  targetInput: string;
  workflowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// React Flow specific types
export interface ReactFlowNodeData {
  label: string;
  description: string;
  status?: "idle" | "running" | "success" | "error";
  webhookUrl?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  actionType?: string;
  endpoint?: string;
  requestBody?: string;
  [key: string]: any;
}

// Node Editor Props
export interface NodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeData: ReactFlowNodeData;
  nodeType: "trigger" | "action" | "custom";
}
