"use client";

import { useState } from "react";
import { useNodeStatus } from "@/hooks/use-node-status";
import { generateSlug } from "random-word-slugs";

export default function TestWorkflowPage() {
  const [executionId, setExecutionId] = useState<string>("");
  const [workflowId, setWorkflowId] = useState<string>("test-workflow");
  const [isStarting, setIsStarting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Subscribe to realtime node status updates
  const { nodeStatuses, isLoading, error, isConnected } =
    useNodeStatus(executionId);

  const handleStartExecution = async () => {
    setIsStarting(true);
    setResult(null);

    try {
      // Generate execution ID
      const newExecutionId = generateSlug(3);
      setExecutionId(newExecutionId);

      // Send workflow execution event directly to Inngest
      const response = await fetch("/api/inngest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "workflow/execute",
          data: {
            executionId: newExecutionId,
            workflowId,
            userId: "test-user",
            inputData: { test: true },
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Workflow execution started",
          executionId: newExecutionId,
        });
      } else {
        setResult({ error: data.error || "Failed to start workflow" });
      }
    } catch (_error) {
      setResult({ error: "Failed to start execution" });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Realtime Workflow Test</h1>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Start Workflow Execution</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Workflow ID:
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={e => setWorkflowId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter workflow ID"
            />
          </div>

          <button
            onClick={handleStartExecution}
            disabled={isStarting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isStarting ? "Starting..." : "Start Workflow Execution"}
          </button>

          {result && (
            <div
              className={`p-3 rounded ${result.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {result.error ? (
                <div>Error: {result.error}</div>
              ) : (
                <div>
                  <div>✅ Workflow started!</div>
                  <div className="text-sm mt-1">
                    Execution ID: {result.executionId}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Realtime Connection</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span>
              {isConnected ? "Connected to realtime" : "Disconnected"}
            </span>
          </div>
          {isLoading && <div className="text-sm text-blue-600">Loading...</div>}
          {error && (
            <div className="text-sm text-red-600">Error: {error.message}</div>
          )}
        </div>
      </div>

      {executionId && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Node Status Updates</h2>
          <div className="text-sm text-yellow-700 mb-2">
            Monitoring execution:{" "}
            <code className="bg-yellow-100 px-2 py-1 rounded">
              {executionId}
            </code>
          </div>

          {nodeStatuses.length === 0 ? (
            <div className="text-gray-500">
              No node status updates yet. Start a workflow to see real-time
              updates!
            </div>
          ) : (
            <div className="space-y-2">
              {nodeStatuses.map((node, index) => (
                <div
                  key={`${node.nodeId}-${index}`}
                  className={`p-3 rounded border ${
                    node.status === "success"
                      ? "bg-green-50 border-green-200"
                      : node.status === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{node.nodeName}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        node.status === "success"
                          ? "bg-green-100 text-green-800"
                          : node.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  {node.message && (
                    <div className="text-sm text-gray-600 mt-1">
                      {node.message}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(node.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
