// Components
export {
	formatErrorMessage,
	formatErrorWithContext,
	formatFileOperationError,
	formatPluginError,
	formatValidationError,
	collectErrors,
	addErrorIf,
	validateRequiredString,
	validateStringFormat,
	validateArray,
	hasErrors,
	getFirstError,
	joinErrors,
	serializeRegistry,
	deserializeRegistry,
	registryToJson,
	jsonToRegistry,
} from "./components";

// Types
export type { PluginResult } from "./types";
export { success, failure, isSuccess, isFailure, mapResult, flatMapResult, getOrThrow, getOrDefault } from "./types";

// Config
export {
	createPluginLogger,
	createPluginManagerConfig,
	DEFAULT_LOGGER_CONFIG,
	type LogLevel,
	type PluginLogger,
	type PluginLoggerConfig,
	validateConfig,
} from "./config";
// Constants
export {
	DEFAULT_CACHE_DIR,
	DEFAULT_CONFIG,
	DEFAULT_MAX_PLUGINS,
	DEFAULT_PLUGIN_DIR,
	DEFAULT_PLUGIN_PATTERNS,
} from "./constant";
// Services
export {
	analyzeRegistry,
	createFileStorage,
	createMemoryStorage,
	createMetricsCollector,
	createPluginManager,
	discoverPlugins,
	type DiscoveryResult,
	loadPlugin,
	loadPlugins,
	type MetricsCollector,
	type PluginLoadResult,
	type PluginManager,
	type PluginStorage,
	sortPluginsByDependencies,
} from "./services";
export type {
	Plugin,
	PluginAPI,
	PluginCapabilities,
	PluginDependency,
	PluginDiscoveryOptions,
	PluginEvent,
	PluginEventEmitter,
	PluginEventHandler,
	PluginEventType,
	PluginHooks,
	PluginLoadOptions,
	PluginManagerConfig,
	PluginMetadata,
	PluginPriority,
	PluginRegistry,
	PluginState,
	PluginStatus,
} from "./types";

// Utils
export {
	buildDependencyGraph,
	createEventEmitter,
	type DependencyGraph,
	detectCircularDependencies,
	formatDate,
	formatHealth,
	formatList,
	formatPluginInfo,
	formatStats,
	formatStatus,
	formatTable,
	getLoadOrder,
	isPluginCompatible,
	resolveDependencies,
	validatePlugin,
	validatePluginMetadata,
} from "./utils";
