import { useNodeStatus } from "@/hooks/use-node-status";

interface NodeStatusDisplayProps {
  executionId: string;
}

export function NodeStatusDisplay({ executionId }: NodeStatusDisplayProps) {
  const { nodeStatuses, isLoading, error, isConnected } =
    useNodeStatus(executionId);

  if (isLoading) {
    return <div>Connecting to realtime updates...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isConnected) {
    return <div>Waiting for connection...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Node Status</h3>
      {nodeStatuses.length === 0 ? (
        <div className="text-gray-500">No nodes executed yet</div>
      ) : (
        <div className="space-y-2">
          {nodeStatuses.map(node => (
            <div
              key={node.nodeId}
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
                <div className="text-sm text-gray-600 mt-1">{node.message}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(node.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
