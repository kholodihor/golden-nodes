import { useInngestSubscription } from "@/inngest/realtime";
import { httpRequestChannel } from "@/inngest/realtime";
import { useMemo } from "react";

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
  // Memoize the token to prevent infinite re-renders
  const token = useMemo(
    () => ({
      channel: httpRequestChannel,
      topics: ["node.status"],
    }),
    [],
  );

  const subscription = useInngestSubscription({
    token,
  });

  // Memoize filtered events
  const events = useMemo(
    () =>
      subscription.data.filter(
        (event: NodeStatusEvent) => event.data.executionId === executionId,
      ),
    [subscription.data, executionId],
  );

  // Memoize latest events map
  const latestEvents = useMemo(() => {
    const eventsMap = new Map<string, NodeStatusData>();

    events.forEach((event: NodeStatusEvent) => {
      const existing = eventsMap.get(event.data.nodeId);
      if (
        !existing ||
        new Date(event.data.timestamp) > new Date(existing.timestamp)
      ) {
        eventsMap.set(event.data.nodeId, event.data);
      }
    });

    return eventsMap;
  }, [events]);

  // Memoize node statuses array
  const nodeStatuses = useMemo(() => {
    return Array.from(latestEvents.values()).map(data => {
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
  }, [latestEvents]);

  return {
    nodeStatuses,
    isLoading:
      subscription.state === "connecting" ||
      subscription.state === "refresh_token",
    error: subscription.error,
    isConnected: subscription.state === "active",
  };
}
