/**
 * adapter/ barrel exports
 * IO layer - external integrations, I/O operations
 */

// Command execution (I/O operations)
export { executeCommand, executePipeline, ExecuteError, initializeBuiltins, registerBuiltin } from "./executor";
