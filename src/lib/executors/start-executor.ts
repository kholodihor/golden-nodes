import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";

export class StartNodeExecutor extends BaseNodeExecutor {
  type = "START" as NodeType;
  name = "Start Node";
  description = "Workflow trigger that initializes execution data";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Initializing workflow execution");

    // Start node typically just passes through and adds metadata
    const result = {
      message: "Workflow started",
      timestamp: new Date().toISOString(),
      executionId: context.executionId,
      nodeId: context.nodeId,
      ...inputData,
    };

    this.log(
      context,
      `Workflow initialized with ${Object.keys(inputData).length} input fields`,
    );

    return result;
  }

  validate(_nodeData: any): { isValid: boolean; errors: string[] } {
    // Start nodes don't require specific configuration
    return { isValid: true, errors: [] };
  }

  getSchema(): any {
    return {
      type: "object",
      properties: {
        label: {
          type: "string",
          title: "Label",
          description: "Display name for the start node",
        },
        description: {
          type: "string",
          title: "Description",
          description: "What this start node does",
        },
      },
      required: ["label"],
    };
  }
}
