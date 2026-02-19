/**
 * services/ barrel exports
 * Business logic layer (flow)
 */

// Shell service
export { Shell, getGlobalShell, setGlobalShell } from "./shell.service";

// Filter command registration
export { registerFilterCommands } from "./filters.register";
