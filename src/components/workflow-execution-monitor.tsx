import { useState } from "react";
import { NodeStatusDisplay } from "./node-status-display";

interface WorkflowExecutionMonitorProps {
  workflowId: string;
  executionId: string;
}

export function WorkflowExecutionMonitor({
  workflowId,
  executionId,
}: WorkflowExecutionMonitorProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleStartExecution = async () => {
    setIsExecuting(true);

    try {
      // Start your workflow execution
      const response = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, executionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start workflow");
      }
    } catch (error) {
      console.error("Error starting workflow:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Execution</h2>
        <button
          onClick={handleStartExecution}
          disabled={isExecuting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isExecuting ? "Starting..." : "Start Execution"}
        </button>
      </div>

      <NodeStatusDisplay executionId={executionId} />
    </div>
  );
}
