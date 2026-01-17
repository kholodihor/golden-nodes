import { executorRegistry } from "../executor-registry";
import { StartNodeExecutor } from "./start-executor";
import { ActionNodeExecutor } from "./action-executor";
import { ConditionNodeExecutor } from "./condition-executor";
import { HttpRequestNodeExecutor } from "./http-request-executor";

// Register all built-in executors
export function initializeExecutors() {
  // Register core executors
  executorRegistry.register(new StartNodeExecutor());
  executorRegistry.register(new ActionNodeExecutor());
  executorRegistry.register(new ConditionNodeExecutor());
  executorRegistry.register(new HttpRequestNodeExecutor());

  // Log registered executors
  const executors = executorRegistry.getAll();
  console.log(
    `Registered ${executors.length} executors:`,
    executors.map(e => e.name),
  );
}

// Auto-initialize when module is imported
initializeExecutors();

// Export the registry for external use
export { executorRegistry };

// Export executor classes for potential extension
export {
  StartNodeExecutor,
  ActionNodeExecutor,
  ConditionNodeExecutor,
  HttpRequestNodeExecutor,
};
