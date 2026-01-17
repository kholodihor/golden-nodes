import { BaseNodeExecutor, ExecutionContext } from "../executor-registry";
import { NodeType } from "@/types";

export class DatabaseQueryExecutor extends BaseNodeExecutor {
  type = "DATABASE_QUERY" as NodeType;
  name = "Database Query Node";
  description = "Executes database queries";

  async execute(
    nodeData: any,
    inputData: any,
    context: ExecutionContext,
  ): Promise<any> {
    this.log(context, "Executing database query node");

    const { queryType, query, tableName } = nodeData;

    try {
      // Replace variables in SQL query using Handlebars
      const processedQuery = this.replaceVariables(
        query || "SELECT * FROM users WHERE id = {{trigger.data.userId}}",
        inputData,
      );

      this.log(context, `Executing ${queryType || "SELECT"} query`);
      this.log(context, `Query: ${processedQuery}`);

      // TODO: Implement actual database query logic here
      // For now, we'll simulate database operations
      let result;

      switch (queryType) {
        case "SELECT":
          // Simulate SELECT query
          result = {
            queryType: "SELECT",
            rows: [
              { id: 1, name: "John Doe", email: "john@example.com" },
              { id: 2, name: "Jane Smith", email: "jane@example.com" },
            ],
            rowCount: 2,
            tableName: tableName || "users",
          };
          break;

        case "INSERT":
          // Simulate INSERT query
          result = {
            queryType: "INSERT",
            insertedId: Math.floor(Math.random() * 1000) + 100,
            affectedRows: 1,
            tableName: tableName || "users",
          };
          break;

        case "UPDATE":
          // Simulate UPDATE query
          result = {
            queryType: "UPDATE",
            affectedRows: 1,
            tableName: tableName || "users",
          };
          break;

        case "DELETE":
          // Simulate DELETE query
          result = {
            queryType: "DELETE",
            affectedRows: 1,
            tableName: tableName || "users",
          };
          break;

        default:
          result = {
            queryType: "SELECT",
            rows: [],
            rowCount: 0,
            tableName: tableName || "users",
          };
      }

      // Simulate database query delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const finalResult = {
        ...result,
        timestamp: new Date().toISOString(),
        originalQuery: processedQuery,
        success: true,
      };

      this.log(context, `Database query completed successfully`);

      return finalResult;
    } catch (error) {
      this.log(
        context,
        `Database query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
      throw new Error(
        `Database query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  validate(nodeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!nodeData.query) {
      errors.push("SQL query is required");
    }

    if (
      nodeData.queryType &&
      !["SELECT", "INSERT", "UPDATE", "DELETE"].includes(nodeData.queryType)
    ) {
      errors.push(
        "Invalid query type. Must be one of: SELECT, INSERT, UPDATE, DELETE",
      );
    }

    // Basic SQL injection prevention check
    if (nodeData.query && nodeData.query.toLowerCase().includes("drop ")) {
      errors.push("DROP statements are not allowed for security reasons");
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
        queryType: {
          type: "string",
          enum: ["SELECT", "INSERT", "UPDATE", "DELETE"],
          title: "Query Type",
          description: "Type of SQL query to execute",
        },
        query: {
          type: "string",
          title: "SQL Query",
          description: "SQL query to execute (supports Handlebars templating)",
        },
        tableName: {
          type: "string",
          title: "Table Name",
          description: "Target table name (for SELECT queries)",
        },
      },
      required: ["query"],
    };
  }
}
