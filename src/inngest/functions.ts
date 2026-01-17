import prisma from "@/lib/prisma";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { executorRegistry } from "@/lib/executors";
import { httpRequestChannel } from "./realtime";

const google = createGoogleGenerativeAI();

// Helper function to publish node status events
async function publishNodeStatus({
  nodeId,
  nodeName,
  executionId,
  message,
}: {
  nodeId: string;
  nodeName: string;
  executionId: string;
  message?: string;
}) {
  try {
    const channel = httpRequestChannel();
    await channel["node.status"]({
      nodeId,
      nodeName,
      executionId,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to publish node status:", error);
  }
}

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
      const wf = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: {
            orderBy: { createdAt: "asc" },
          },
          connections: true,
        },
      });

      // Debug logging
      console.log("Workflow data:", JSON.stringify(wf, null, 2));
      if (wf?.nodes) {
        console.log(
          "Node types:",
          wf.nodes.map(n => ({ id: n.id, type: n.type, name: n.name })),
        );
      }

      return wf;
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // Find start node
    const startNode = workflow.nodes.find(node => node.type === "START");
    if (!startNode) {
      console.error(
        "Available node types:",
        workflow.nodes.map(n => n.type),
      );
      throw new Error(
        `No start node found in workflow. Available node types: ${workflow.nodes.map(n => n.type).join(", ")}`,
      );
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
        // Publish loading event
        await publishNodeStatus({
          nodeId: node.id,
          nodeName: node.name,
          executionId,
          message: "Starting node execution",
        });

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
    let nodeResult: any;
    try {
      nodeResult = await step.run(`execute-node-${node.id}`, async () => {
        const context = {
          executionId,
          nodeId: node.id,
          workflowId: workflow.id,
          startTime: new Date(),
          logger: (message: string, _level?: "info" | "warn" | "error") => {
            console.log(`[${executionId}] ${message}`);
          },
        };
        return executeNodeByType(node, inputData, context);
      });

      // Update node execution as success
      await step.run(`update-node-success-${node.id}`, async () => {
        // Publish success event
        await publishNodeStatus({
          nodeId: node.id,
          nodeName: node.name,
          executionId,
          message: "Node completed successfully",
        });

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
      // Publish error event
      await publishNodeStatus({
        nodeId: node.id,
        nodeName: node.name,
        executionId,
        message: error instanceof Error ? error.message : "Unknown error",
      });

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
async function executeNodeByType(
  node: any,
  inputData: any,
  context: any,
): Promise<any> {
  const executor = executorRegistry.get(node.type);

  if (!executor) {
    throw new Error(`No executor found for node type: ${node.type}`);
  }

  // Validate node data before execution
  const validation = executorRegistry.validate(node.type, node.data);
  if (!validation.isValid) {
    throw new Error(`Node validation failed: ${validation.errors.join(", ")}`);
  }

  // Execute using the registered executor
  return await executor.execute(node.data, inputData, context);
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
