import { channel, topic } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";

// Define the node status topic
const nodeStatusTopic = topic("node.status").type<{
  nodeId: string;
  nodeName: string;
  executionId: string;
  message?: string;
  timestamp: string;
}>();

// Define the httpRequest channel for node status updates
export const httpRequestChannel =
  channel("httpRequest").addTopic(nodeStatusTopic);

// Type definitions for our events
export type NodeStatusEvent = {
  name: "loading" | "error" | "success";
  data: {
    nodeId: string;
    nodeName: string;
    executionId: string;
    message?: string;
    timestamp: string;
  };
};

// Export the hook for easy use
export { useInngestSubscription };
