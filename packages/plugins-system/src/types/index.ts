export {
	PluginCircularDependencyError,
	PluginDependencyError,
	PluginError,
	PluginLoadError,
	PluginValidationError,
} from "./errors.types";

export type { PluginEvent, PluginEventEmitter, PluginEventHandler, PluginEventType } from "./events.types";
export type { PluginHealthCheck, PluginMetrics, PluginPerformanceStats } from "./metrics.types";
export type { PluginPermission, PluginPermissions, PluginSecurityContext } from "./permissions.types";
export { checkPermissions, hasPermission } from "./permissions.types";
export type {
	Plugin,
	PluginAPI,
	PluginCapabilities,
	PluginDependency,
	PluginDiscoveryOptions,
	PluginHooks,
	PluginLoadOptions,
	PluginLoggerLike,
	PluginManagerConfig,
	PluginMetadata,
	PluginPriority,
	PluginRegistry,
	PluginState,
	PluginStatus,
} from "./plugin.types";
// Result type for plugin operations
export type { PluginResult } from "./result";
export { success, failure, isSuccess, isFailure, mapResult, flatMapResult, getOrThrow, getOrDefault } from "./result";
