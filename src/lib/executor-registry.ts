import { NodeType } from "@/types";
import Handlebars from "handlebars";

export interface NodeExecutor {
  type: NodeType;
  name: string;
  description: string;
  execute: (
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ) => Promise<any>;
  validate?: (nodeData: any) => { isValid: boolean; errors: string[] };
  getSchema?: () => any; // JSON schema for node configuration
}

export interface ExecutionContext {
  executionId: string;
  nodeId: string;
  workflowId: string;
  userId: string;
  startTime: Date;
  logger: (message: string, level?: "info" | "warn" | "error") => void;
}

export interface ExecutorRegistry {
  register(executor: NodeExecutor): void;
  get(type: NodeType): NodeExecutor | undefined;
  getAll(): NodeExecutor[];
  validate(
    type: NodeType,
    nodeData: any,
  ): { isValid: boolean; errors: string[] };
  getSchema(type: NodeType): any;
}

class ExecutorRegistryImpl implements ExecutorRegistry {
  private executors = new Map<NodeType, NodeExecutor>();

  register(executor: NodeExecutor): void {
    if (this.executors.has(executor.type)) {
      throw new Error(
        `Executor for type ${executor.type} is already registered`,
      );
    }
    this.executors.set(executor.type, executor);
  }

  get(type: NodeType): NodeExecutor | undefined {
    return this.executors.get(type);
  }

  getAll(): NodeExecutor[] {
    return Array.from(this.executors.values());
  }

  validate(
    type: NodeType,
    nodeData: any,
  ): { isValid: boolean; errors: string[] } {
    const executor = this.get(type);
    if (!executor) {
      return {
        isValid: false,
        errors: [`No executor found for node type: ${type}`],
      };
    }

    if (executor.validate) {
      return executor.validate(nodeData);
    }

    return { isValid: true, errors: [] };
  }

  getSchema(type: NodeType): any {
    const executor = this.get(type);
    return executor?.getSchema?.();
  }
}

// Global registry instance
export const executorRegistry = new ExecutorRegistryImpl();

// Base executor class for common functionality
export abstract class BaseNodeExecutor implements NodeExecutor {
  abstract type: NodeType;
  abstract name: string;
  abstract description: string;

  abstract execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any>;

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    // Basic validation - can be overridden by subclasses
    if (!nodeData || typeof nodeData !== "object") {
      return {
        isValid: false,
        errors: ["Node data must be a valid object"],
      };
    }

    return { isValid: true, errors: [] };
  }

  protected log(
    context: ExecutionContext,
    message: string,
    level: "info" | "warn" | "error" = "info",
  ): void {
    context.logger(`[${this.type}] ${message}`, level);
  }

  protected replaceVariables(template: string, variables: any): string {
    if (typeof template !== "string") return template;

    try {
      const compiled = Handlebars.compile(template);
      return compiled(variables);
    } catch (error) {
      // Fallback to original template if Handlebars compilation fails
      this.log(
        {
          executionId: "unknown",
          nodeId: "unknown",
          workflowId: "unknown",
          userId: "unknown",
          startTime: new Date(),
          logger: console.log,
        },
        `Template compilation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "warn",
      );
      return template;
    }
  }

  protected validateRequiredFields(
    nodeData: any,
    requiredFields: string[],
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!nodeData[field]) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
