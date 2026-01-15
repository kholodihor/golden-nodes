import prisma from "@/lib/prisma";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

// Main workflow execution function
export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { executionId, workflowId, userId: _userId, inputData } = event.data;

    // Update execution status to RUNNING
    await step.run("update-execution-running", async () => {
      return prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: "RUNNING",
          startedAt: new Date(),
        },
      });
    });

    // Get workflow with nodes and connections
    const workflow = await step.run("get-workflow", async () => {
      return prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: {
            orderBy: { createdAt: "asc" },
          },
          connections: true,
        },
      });
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Find start node
    const startNode = workflow.nodes.find(node => node.type === "START");
    if (!startNode) {
      throw new Error("No start node found in workflow");
    }

    // Execute nodes in sequence
    const executionResults = await executeNodeSequence({
      step,
      executionId,
      workflow,
      startNodeId: startNode.id,
      initialData: inputData,
    });

    // Update execution status to SUCCESS
    await step.run("update-execution-success", async () => {
      return prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          outputData: executionResults,
        },
      });
    });

    return executionResults;
  },
);

// Topological sort to determine execution order
function getExecutionOrder(workflow: any, startNodeId: string): string[] {
  const { nodes, connections } = workflow;
  const nodeMap = new Map(nodes.map((node: any) => [node.id, node]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const executionOrder: string[] = [];

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node: any) => {
    adjacencyList.set(node.id, []);
  });

  connections.forEach((conn: any) => {
    const targets = adjacencyList.get(conn.sourceNodeId) || [];
    targets.push(conn.targetNodeId);
    adjacencyList.set(conn.sourceNodeId, targets);
  });

  // DFS-based topological sort
  function dfs(nodeId: string) {
    if (visiting.has(nodeId)) {
      throw new Error(`Cycle detected in workflow involving node: ${nodeId}`);
    }
    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];

    for (const neighbor of neighbors) {
      dfs(neighbor);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    executionOrder.push(nodeId);
  }

  // Start from the start node
  dfs(startNodeId);

  // Reverse to get correct order (dependencies first)
  return executionOrder.reverse();
}

// Node execution helper function
async function executeNodeSequence({
  step,
  executionId,
  workflow,
  startNodeId,
  initialData,
}: {
  step: any;
  executionId: string;
  workflow: any;
  startNodeId: string;
  initialData: any;
}) {
  const results: any = {};
  const nodeDataMap = new Map<string, any>();

  // Get topological execution order
  const executionOrder = getExecutionOrder(workflow, startNodeId);

  // Execute nodes in topological order
  for (const nodeId of executionOrder) {
    const node = workflow.nodes.find((n: any) => n.id === nodeId);
    if (!node) continue;

    // Gather input data from all predecessor nodes
    const predecessorData: any = {};
    const incomingConnections = workflow.connections.filter(
      (conn: any) => conn.targetNodeId === nodeId,
    );

    for (const conn of incomingConnections) {
      const sourceData = nodeDataMap.get(conn.sourceNodeId);
      if (sourceData) {
        predecessorData[conn.sourceOutput] = sourceData;
      }
    }

    const inputData = {
      ...initialData,
      ...predecessorData,
    };

    // Create node execution record
    const nodeExecution = await step.run(
      `create-node-execution-${node.id}`,
      async () => {
        return prisma.nodeExecution.create({
          data: {
            executionId,
            nodeId: node.id,
            nodeType: node.type,
            nodeName: node.name,
            status: "RUNNING",
            startedAt: new Date(),
            inputData,
          },
        });
      },
    );

    // Execute node based on type
    let nodeResult;
    try {
      nodeResult = await step.run(`execute-node-${node.id}`, async () => {
        return executeNodeByType(node, inputData);
      });

      // Update node execution as success
      await step.run(`update-node-success-${node.id}`, async () => {
        return prisma.nodeExecution.update({
          where: { id: nodeExecution.id },
          data: {
            status: "SUCCESS",
            completedAt: new Date(),
            outputData: nodeResult,
          },
        });
      });

      // Store node result for dependent nodes
      nodeDataMap.set(node.id, nodeResult);
      results[node.id] = nodeResult;
    } catch (error) {
      // Update node execution as failed
      await step.run(`update-node-failed-${node.id}`, async () => {
        return prisma.nodeExecution.update({
          where: { id: nodeExecution.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      });

      throw error;
    }
  }

  return results;
}

// Execute individual node based on type
async function executeNodeByType(node: any, inputData: any) {
  const nodeData = node.data as any;

  switch (node.type) {
    case "START":
      // Start node typically just passes through input data
      return {
        message: "Workflow started",
        timestamp: new Date().toISOString(),
        ...inputData,
      };

    case "ACTION":
      // Handle HTTP request nodes
      if (nodeData.endpoint && nodeData.method) {
        return await executeHttpRequest(nodeData, inputData);
      }

      // Handle other action types
      return {
        action: "executed",
        nodeType: nodeData.actionType || "unknown",
        input: inputData,
        output: `Processed by ${node.name}`,
      };

    case "CONDITION":
      // Handle conditional logic
      return executeCondition(nodeData, inputData);

    default:
      return {
        message: `Executed ${node.type} node`,
        input: inputData,
      };
  }
}

// HTTP request execution
async function executeHttpRequest(nodeData: any, inputData: any) {
  const { method, endpoint, headers, requestBody } = nodeData;

  try {
    const url = replaceVariables(endpoint, inputData);
    const body = requestBody
      ? replaceVariables(requestBody, inputData)
      : undefined;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
      status: response.status,
      statusText: response.statusText,
      data,
      success: response.ok,
    };
  } catch (error) {
    throw new Error(
      `HTTP request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Condition execution
async function executeCondition(nodeData: any, inputData: any) {
  // Simple condition evaluation - can be expanded
  const condition = nodeData.condition || "true";

  try {
    // Basic evaluation - in production, use a safer expression evaluator
    const result = eval(replaceVariables(condition, inputData));

    return {
      condition,
      result,
      branch: result ? "true" : "false",
    };
  } catch (error) {
    throw new Error(
      `Condition evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Variable replacement helper
function replaceVariables(template: string, variables: any): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Workflow cancellation function
export const cancelWorkflow = inngest.createFunction(
  { id: "cancel-workflow" },
  { event: "workflow/cancel" },
  async ({ event, step }) => {
    const {
      executionId,
      workflowId: _workflowId,
      userId: _userId,
    } = event.data;

    // Update all running node executions to cancelled
    await step.run("cancel-node-executions", async () => {
      return prisma.nodeExecution.updateMany({
        where: {
          executionId,
          status: "RUNNING",
        },
        data: {
          status: "CANCELLED",
          completedAt: new Date(),
        },
      });
    });

    return { message: "Workflow cancelled successfully" };
  },
);

// Keep the existing AI function for reference
export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event: _event, step }) => {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You  are a helpful assistant",
      prompt: "What is 2+2?",
    });
    return steps;
  },
);
