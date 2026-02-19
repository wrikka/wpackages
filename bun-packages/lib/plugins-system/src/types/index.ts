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

export type { PluginResult } from "./result";
export { success, failure, isSuccess, isFailure, mapResult, flatMapResult, getOrThrow, getOrDefault } from "./result";

export type {
	HotReloadEvent,
	HotReloadManager,
	HotReloadOptions,
	HotReloadResult,
	HotReloadState,
	HotReloadStrategy,
} from "./hot-reload.types";

export type {
	SandboxContext,
	SandboxManager,
	SandboxOptions,
	SandboxResult,
	SandboxType,
	ResourceLimit,
	ResourceLimitType,
} from "./sandbox.types";

export type {
	MarketplaceDependency,
	MarketplaceInstallOptions,
	MarketplaceManager,
	MarketplacePlugin,
	MarketplaceSearchOptions,
	MarketplaceSearchResult,
} from "./marketplace.types";

export type {
	ConfigMigration,
	ConfigSchema,
	ConfigSchemaManager,
	ConfigValidationError,
	ConfigValidationResult,
	SchemaProperty,
} from "./config-schema.types";

export type {
	HealthCheckConfig,
	HealthCheckManager,
	HealthCheckOptions,
	HealthCheckResult,
	HealthStatus,
} from "./health-check.types";

export type {
	CacheEntry,
	CacheManager,
	CacheOptions,
	CacheStats,
	CacheStrategy,
} from "./cache.types";

export type {
	TelemetryConfig,
	TelemetryEvent,
	TelemetryManager,
	UsageStats,
	FeatureUsage,
} from "./telemetry.types";

export type {
	TestFixture,
	TestCase,
	TestSuite,
	TestResult,
	TestRunResult,
	TestingFramework,
} from "./testing.types";

export type {
	DocumentationOptions,
	APIDocumentation,
	MethodDocumentation,
	ParameterDocumentation,
	EventDocumentation,
	TypeDocumentation,
	PropertyDocumentation,
	DocumentationGenerator,
} from "./documentation.types";

export type {
	CLICommand,
	CLIOption,
	CLIConfig,
	CLIRunResult,
	CLITool,
} from "./cli.types";

export type {
	MigrationScript,
	MigrationResult,
	MigrationHistory,
	MigrationOptions,
	MigrationManager,
} from "./migration.types";

export type {
	DependencyDescriptor,
	DependencyLifetime,
	ServiceContainer,
	DIContext,
	DIPluginAPI,
} from "./di.types";

export type {
	EventFilter,
	EventTransformer,
	EventSubscription,
	EventReplayOptions,
	PersistedEvent,
	AdvancedEventBus,
} from "./event-bus.types";
