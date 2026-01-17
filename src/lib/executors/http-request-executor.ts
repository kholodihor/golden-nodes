import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";
import ky from "ky";

export class HttpRequestNodeExecutor extends BaseNodeExecutor {
  type = "HTTP_REQUEST" as NodeType;
  name = "HTTP Request Node";
  description = "Makes HTTP requests to external APIs";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Executing HTTP request node");

    const {
      method,
      endpoint,
      headers,
      requestBody,
      timeout = 30000,
    } = nodeData;

    try {
      // Replace variables in URL and body using Handlebars
      const url = this.replaceVariables(endpoint || "", inputData);
      const body = requestBody
        ? this.replaceVariables(requestBody, inputData)
        : undefined;

      // Parse body if it's a JSON string
      let parsedBody = body;
      if (body && typeof body === "string") {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          // Keep as string if not valid JSON
          parsedBody = body;
        }
      }

      this.log(context, `Making ${method || "GET"} request to ${url}`);

      // Use ky for better HTTP handling
      const response = await ky(url, {
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        json: parsedBody,
        timeout: timeout,
        throwHttpErrors: false, // Let us handle HTTP errors
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
        method: method || "GET",
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

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!nodeData.endpoint) {
      errors.push("Endpoint URL is required");
    }

    if (
      nodeData.method &&
      !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(nodeData.method)
    ) {
      errors.push(
        "Invalid HTTP method. Must be one of: GET, POST, PUT, DELETE, PATCH",
      );
    }

    if (nodeData.endpoint && !this.isValidUrl(nodeData.endpoint)) {
      errors.push("Invalid endpoint URL format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getSchema(): any {
    return {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          default: "POST",
          title: "HTTP Method",
        },
        endpoint: {
          type: "string",
          title: "Endpoint URL",
          description: "URL for HTTP requests (supports Handlebars templating)",
        },
        headers: {
          type: "object",
          title: "Headers",
          description: "HTTP headers",
        },
        requestBody: {
          type: "string",
          title: "Request Body",
          description:
            "JSON request body template (supports Handlebars templating)",
        },
        timeout: {
          type: "number",
          minimum: 1000,
          maximum: 300000,
          default: 30000,
          title: "Timeout (ms)",
        },
      },
      required: ["endpoint"],
    };
  }
}
