import { executorRegistry } from "../executor-registry";
import { NodeType } from "@/types";

export interface NodeSchema {
  type: NodeType;
  name: string;
  description: string;
  schema: any;
}

export function getAllNodeSchemas(): NodeSchema[] {
  const executors = executorRegistry.getAll();

  return executors.map(executor => ({
    type: executor.type,
    name: executor.name,
    description: executor.description,
    schema: executor.getSchema?.() || {},
  }));
}

export function getNodeSchema(type: NodeType): any {
  return executorRegistry.getSchema(type);
}

export function getAvailableNodeTypes(): NodeType[] {
  const executors = executorRegistry.getAll();
  return executors.map(executor => executor.type);
}
