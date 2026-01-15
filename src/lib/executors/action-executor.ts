import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";

export class ActionNodeExecutor extends BaseNodeExecutor {
  type = "ACTION" as NodeType;
  name = "Action Node";
  description = "Performs HTTP requests and other actions";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Executing action node");

    const {
      actionType,
      endpoint,
      method,
      headers,
      requestBody,
      timeout = 30000,
    } = nodeData;

    switch (actionType) {
      case "http_request":
        return await this.executeHttpRequest(
          { endpoint, method, headers, requestBody, timeout },
          inputData,
          context,
        );

      case "webhook":
        return await this.executeWebhook(nodeData, inputData, context);

      case "delay":
        return await this.executeDelay(nodeData, inputData, context);

      default:
        return await this.executeGenericAction(nodeData, inputData, context);
    }
  }

  private async executeHttpRequest(
    config: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    const { endpoint, method, headers, requestBody, timeout } = config;

    this.log(context, `Making ${method} request to ${endpoint}`);

    try {
      // Replace variables in URL and body
      const url = this.replaceVariables(endpoint, inputData);
      const body = requestBody
        ? this.replaceVariables(requestBody, inputData)
        : undefined;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeout),
      });

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        success: response.ok,
        url,
        method,
      };

      this.log(
        context,
        `HTTP request completed with status ${response.status}`,
      );

      return result;
    } catch (error) {
      this.log(
        context,
        `HTTP request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
      throw new Error(
        `HTTP request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async executeWebhook(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Executing webhook action");

    // Webhook execution logic
    return {
      webhookExecuted: true,
      timestamp: new Date().toISOString(),
      data: inputData,
    };
  }

  private async executeDelay(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    const delayMs = nodeData.delayMs || 1000;

    this.log(context, `Delaying execution for ${delayMs}ms`);

    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      delayed: true,
      delayMs,
      timestamp: new Date().toISOString(),
      ...inputData,
    };
  }

  private async executeGenericAction(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(
      context,
      `Executing generic action: ${nodeData.actionType || "unknown"}`,
    );

    return {
      action: nodeData.actionType || "executed",
      input: inputData,
      output: `Processed by ${nodeData.name || "action node"}`,
      timestamp: new Date().toISOString(),
    };
  }

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!nodeData.actionType) {
      errors.push("Action type is required");
    }

    if (nodeData.actionType === "http_request") {
      const httpValidation = this.validateRequiredFields(nodeData, [
        "endpoint",
        "method",
      ]);
      if (!httpValidation.isValid) {
        errors.push(...httpValidation.errors);
      }

      if (
        nodeData.method &&
        !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(nodeData.method)
      ) {
        errors.push("Invalid HTTP method");
      }
    }

    if (
      nodeData.actionType === "delay" &&
      nodeData.delayMs &&
      (nodeData.delayMs < 0 || nodeData.delayMs > 300000)
    ) {
      errors.push(
        "Delay must be between 0 and 300000 milliseconds (5 minutes)",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getSchema(): any {
    return {
      type: "object",
      properties: {
        actionType: {
          type: "string",
          enum: ["http_request", "webhook", "delay", "custom"],
          title: "Action Type",
          description: "Type of action to perform",
        },
        endpoint: {
          type: "string",
          title: "Endpoint URL",
          description: "URL for HTTP requests",
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          title: "HTTP Method",
        },
        headers: {
          type: "object",
          title: "Headers",
          description: "HTTP headers",
        },
        requestBody: {
          type: "string",
          title: "Request Body",
          description: "JSON request body template",
        },
        timeout: {
          type: "number",
          minimum: 1000,
          maximum: 300000,
          default: 30000,
          title: "Timeout (ms)",
        },
        delayMs: {
          type: "number",
          minimum: 0,
          maximum: 300000,
          title: "Delay (ms)",
        },
      },
      required: ["actionType"],
      dependencies: {
        http_request: {
          properties: {
            endpoint: {},
            method: {},
          },
          required: ["endpoint", "method"],
        },
      },
    };
  }
}
