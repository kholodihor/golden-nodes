import { WorkflowNode, WorkflowConnection } from "@/types";

export interface TopologicalSortResult {
  executionOrder: string[];
  cycles: string[];
  isValid: boolean;
}

/**
 * Performs topological sort on workflow nodes to determine execution order
 * and detects cycles in the workflow graph
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
  startNodeId?: string,
): TopologicalSortResult {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const executionOrder: string[] = [];
  const cycles: string[] = [];

  // Build adjacency list (directed graph)
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  connections.forEach(conn => {
    const targets = adjacencyList.get(conn.sourceNodeId) || [];
    targets.push(conn.targetNodeId);
    adjacencyList.set(conn.sourceNodeId, targets);
  });

  // DFS-based topological sort with cycle detection
  function dfs(nodeId: string, path: string[] = []): void {
    if (visiting.has(nodeId)) {
      // Cycle detected
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart).concat(nodeId);
      cycles.push(cycle.join(" -> "));
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];

    for (const neighbor of neighbors) {
      dfs(neighbor, [...path, nodeId]);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    executionOrder.push(nodeId);
  }

  // Find start nodes (nodes with no incoming connections)
  const startNodes = nodes.filter(
    node => !connections.some(conn => conn.targetNodeId === node.id),
  );

  // If specific start node provided, use it
  if (startNodeId && nodeMap.has(startNodeId)) {
    dfs(startNodeId);
  } else {
    // Otherwise, start from all start nodes
    startNodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });
  }

  // Process any remaining disconnected nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });

  // Reverse to get correct order (dependencies first)
  executionOrder.reverse();

  return {
    executionOrder,
    cycles,
    isValid: cycles.length === 0,
  };
}

/**
 * Validates workflow structure before execution
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for at least one start node
  const startNodes = nodes.filter(node => node.type === "START");
  if (startNodes.length === 0) {
    errors.push("Workflow must have at least one START node");
  }

  // Check for cycles
  const sortResult = topologicalSort(nodes, connections);
  if (!sortResult.isValid) {
    errors.push(`Cycles detected: ${sortResult.cycles.join("; ")}`);
  }

  // Check for orphaned nodes (no incoming or outgoing connections)
  const connectedNodeIds = new Set([
    ...connections.map(c => c.sourceNodeId),
    ...connections.map(c => c.targetNodeId),
  ]);

  const orphanedNodes = nodes.filter(
    node => node.type !== "START" && !connectedNodeIds.has(node.id),
  );

  if (orphanedNodes.length > 0) {
    errors.push(
      `Orphaned nodes found: ${orphanedNodes.map(n => n.name).join(", ")}`,
    );
  }

  // Check for invalid connections
  connections.forEach(conn => {
    const sourceExists = nodes.some(n => n.id === conn.sourceNodeId);
    const targetExists = nodes.some(n => n.id === conn.targetNodeId);

    if (!sourceExists) {
      errors.push(
        `Invalid connection: source node ${conn.sourceNodeId} not found`,
      );
    }
    if (!targetExists) {
      errors.push(
        `Invalid connection: target node ${conn.targetNodeId} not found`,
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets execution order for a specific start node
 */
export function getExecutionOrder(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
  startNodeId: string,
): string[] {
  const result = topologicalSort(nodes, connections, startNodeId);

  if (!result.isValid) {
    throw new Error(`Workflow has cycles: ${result.cycles.join("; ")}`);
  }

  return result.executionOrder;
}
