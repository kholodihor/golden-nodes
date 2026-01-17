import { executorRegistry } from "./executor-registry";
import { ActionNodeExecutor } from "./executors/action-executor";
import { EmailNodeExecutor } from "./executors/email-executor";
import { DatabaseQueryExecutor } from "./executors/database-query-executor";
import { HttpRequestNodeExecutor } from "./executors/http-request-executor";
import { ConditionNodeExecutor } from "./executors/condition-executor";
import { StartNodeExecutor } from "./executors/start-executor";
import { registerHandlebarsHelpers } from "./handlebars-helpers";

// Register Handlebars helpers first
registerHandlebarsHelpers();

// Register all node executors
export function registerExecutors() {
  // Register the legacy action executor (for backward compatibility)
  executorRegistry.register(new ActionNodeExecutor());

  // Register new dedicated executors
  executorRegistry.register(new EmailNodeExecutor());
  executorRegistry.register(new DatabaseQueryExecutor());
  executorRegistry.register(new HttpRequestNodeExecutor());
  executorRegistry.register(new ConditionNodeExecutor());
  executorRegistry.register(new StartNodeExecutor());
}

// Export individual executors for testing or direct use
export {
  ActionNodeExecutor,
  EmailNodeExecutor,
  DatabaseQueryExecutor,
  HttpRequestNodeExecutor,
  ConditionNodeExecutor,
  StartNodeExecutor,
};
