import { useMemo } from "react";
import { WorkflowNode, WorkflowConnection } from "@/types";
import { validateWorkflow, topologicalSort } from "@/utils/topological-sort";

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  executionOrder: string[];
  cycles: string[];
  canExecute: boolean;
}

export function useWorkflowValidation(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
): WorkflowValidationResult {
  const validation = useMemo(() => {
    const validation = validateWorkflow(nodes, connections);
    const sortResult = topologicalSort(nodes, connections);

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      executionOrder: sortResult.executionOrder,
      cycles: sortResult.cycles,
      canExecute: validation.isValid && nodes.length > 0,
    };
  }, [nodes, connections]);

  return validation;
}

export function useWorkflowExecutionOrder(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
  startNodeId?: string,
): { order: string[]; isValid: boolean; cycles: string[] } {
  const result = useMemo(() => {
    if (!startNodeId) {
      return { order: [], isValid: false, cycles: [] };
    }

    try {
      const order = topologicalSort(nodes, connections, startNodeId);
      return {
        order: order.executionOrder,
        isValid: order.isValid,
        cycles: order.cycles,
      };
    } catch (error) {
      return {
        order: [],
        isValid: false,
        cycles: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }, [nodes, connections, startNodeId]);

  return result;
}
