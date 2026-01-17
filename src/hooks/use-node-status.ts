import { useInngestSubscription } from "@/inngest/realtime";
import { httpRequestChannel } from "@/inngest/realtime";

// Node status types
export type NodeStatus = "loading" | "error" | "success";

export interface NodeStatusData {
  nodeId: string;
  nodeName: string;
  executionId: string;
  message?: string;
  timestamp: string;
}

export interface NodeStatusEvent {
  data: NodeStatusData;
}

// Hook to subscribe to node status updates
export function useNodeStatus(executionId: string) {
  const subscription = useInngestSubscription({
    token: {
      channel: httpRequestChannel,
      topics: ["node.status"],
    },
  });

  // Filter events by executionId and determine status
  const events = subscription.data.filter(
    (event: NodeStatusEvent) => event.data.executionId === executionId,
  );

  // Get the latest event for each node
  const latestEvents = new Map<string, NodeStatusData>();

  events.forEach((event: NodeStatusEvent) => {
    const existing = latestEvents.get(event.data.nodeId);
    if (
      !existing ||
      new Date(event.data.timestamp) > new Date(existing.timestamp)
    ) {
      latestEvents.set(event.data.nodeId, event.data);
    }
  });

  // Convert to array and determine status from message content
  const nodeStatuses = Array.from(latestEvents.values()).map(data => {
    let status: NodeStatus = "loading";

    if (data.message?.includes("successfully")) {
      status = "success";
    } else if (
      data.message?.includes("error") ||
      data.message?.includes("failed")
    ) {
      status = "error";
    }

    return {
      nodeId: data.nodeId,
      nodeName: data.nodeName,
      status,
      message: data.message,
      timestamp: data.timestamp,
    };
  });

  return {
    nodeStatuses,
    isLoading:
      subscription.state === "connecting" ||
      subscription.state === "refresh_token",
    error: subscription.error,
    isConnected: subscription.state === "active",
  };
}
