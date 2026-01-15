import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";

export class ConditionNodeExecutor extends BaseNodeExecutor {
  type = "CONDITION" as NodeType;
  name = "Condition Node";
  description = "Evaluates conditions and controls workflow flow";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Evaluating condition");

    const { condition, operator = "equals", value, expression } = nodeData;

    let result: boolean;
    let evaluationDetails: any = {};

    try {
      if (expression) {
        // Evaluate custom expression
        result = this.evaluateExpression(expression, inputData);
        evaluationDetails = {
          type: "expression",
          expression,
          result,
        };
      } else if (condition) {
        // Evaluate simple condition
        result = this.evaluateCondition(condition, operator, value, inputData);
        evaluationDetails = {
          type: "condition",
          condition,
          operator,
          value,
          result,
        };
      } else {
        throw new Error("No condition or expression provided");
      }

      this.log(context, `Condition evaluated to: ${result}`);

      return {
        result,
        branch: result ? "true" : "false",
        evaluationDetails,
        timestamp: new Date().toISOString(),
        ...inputData,
      };
    } catch (error) {
      this.log(
        context,
        `Condition evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
      throw new Error(
        `Condition evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private evaluateCondition(
    condition: string,
    operator: string,
    value: any,
    inputData: any,
  ): boolean {
    // Replace variables in condition
    const leftValue = this.replaceVariables(condition, inputData);

    // Convert to appropriate types for comparison
    const left = this.convertValue(leftValue);
    const right = this.convertValue(value);

    switch (operator) {
      case "equals":
        return left === right;
      case "not_equals":
        return left !== right;
      case "greater_than":
        return Number(left) > Number(right);
      case "less_than":
        return Number(left) < Number(right);
      case "greater_equal":
        return Number(left) >= Number(right);
      case "less_equal":
        return Number(left) <= Number(right);
      case "contains":
        return String(left).includes(String(right));
      case "not_contains":
        return !String(left).includes(String(right));
      case "starts_with":
        return String(left).startsWith(String(right));
      case "ends_with":
        return String(left).endsWith(String(right));
      case "is_empty":
        return (
          !left ||
          (Array.isArray(left)
            ? left.length === 0
            : Object.keys(left).length === 0)
        );
      case "is_not_empty":
        return (
          left &&
          (Array.isArray(left) ? left.length > 0 : Object.keys(left).length > 0)
        );
      case "exists":
        return left !== undefined && left !== null;
      case "not_exists":
        return left === undefined || left === null;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private evaluateExpression(expression: string, inputData: any): boolean {
    // Simple expression evaluation - in production, use a safer expression evaluator
    // For now, we'll use a basic approach with common patterns

    // Replace variables in expression
    const processedExpression = this.replaceVariables(expression, inputData);

    // Basic safety check - only allow certain patterns
    const safePatterns = [
      /^[a-zA-Z_][a-zA-Z0-9_]*(\s*(===|!==|==|!=|>=|<=|>|<)\s*[a-zA-Z0-9_'"{}[\].]+)?$/,
      /^[a-zA-Z_][a-zA-Z0-9_]*(\s*(&&|\|\|)\s*[a-zA-Z_][a-zA-Z0-9_]*)*$/,
      /^!\s*[a-zA-Z_][a-zA-Z0-9_]*$/,
    ];

    const isSafe = safePatterns.some(pattern =>
      pattern.test(processedExpression),
    );
    if (!isSafe) {
      throw new Error("Expression contains unsafe patterns");
    }

    try {
      // Create a safe evaluation context
      const context = { ...inputData };

      // Simple function to evaluate expressions
      const func = new Function(
        "context",
        `
        const { ${Object.keys(context).join(", ")} } = context;
        return ${processedExpression};
      `,
      );

      return Boolean(func(context));
    } catch (error) {
      throw new Error(
        `Expression evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private convertValue(value: any): any {
    if (value === null || value === undefined) return value;

    // Try to parse as number
    if (typeof value === "string") {
      const num = Number(value);
      if (!isNaN(num)) return num;

      // Try to parse as boolean
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;

      // Try to parse as JSON
      try {
        return JSON.parse(value);
      } catch {
        // Return as string if can't parse
        return value;
      }
    }

    return value;
  }

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!nodeData.condition && !nodeData.expression) {
      errors.push("Either condition or expression must be provided");
    }

    if (nodeData.condition && nodeData.expression) {
      errors.push("Cannot provide both condition and expression");
    }

    if (nodeData.condition && !nodeData.operator) {
      errors.push("Operator is required when using condition");
    }

    if (
      nodeData.operator &&
      ![
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "greater_equal",
        "less_equal",
        "contains",
        "not_contains",
        "starts_with",
        "ends_with",
        "is_empty",
        "is_not_empty",
        "exists",
        "not_exists",
      ].includes(nodeData.operator)
    ) {
      errors.push("Invalid operator");
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
        condition: {
          type: "string",
          title: "Condition Field",
          description: "Field to evaluate (use {{variable}} syntax)",
        },
        operator: {
          type: "string",
          enum: [
            "equals",
            "not_equals",
            "greater_than",
            "less_than",
            "greater_equal",
            "less_equal",
            "contains",
            "not_contains",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "exists",
            "not_exists",
          ],
          title: "Operator",
        },
        value: {
          type: "string",
          title: "Value",
          description: "Value to compare against",
        },
        expression: {
          type: "string",
          title: "Expression",
          description:
            "Custom expression (e.g., 'status === \"success\" && count > 5')",
        },
      },
      oneOf: [
        {
          properties: {
            condition: {},
            operator: {},
            value: {},
          },
          required: ["condition", "operator", "value"],
        },
        {
          properties: {
            expression: {},
          },
          required: ["expression"],
        },
      ],
    };
  }
}
