/**
 * release - Modern release automation tool
 * @module
 */

// Export types
export type {
	ChangelogEntry,
	Commit,
	CommitType,
	ReleaseOptions,
	ReleaseResult,
	ReleaseType,
	VersionBump,
} from "./types/index";

// Export services
export { ChangelogService, GitService, PublishService, VersionService } from "./services/index";

// Export preview services
export { type AnalyticsEvent, AnalyticsService, type PreviewStats } from "./services/analytics.service";
export { type GitHubCommentOptions, type GitHubPRInfo, GitHubService } from "./services/github.service";
export { type MonorepoConfig, type MonorepoPackage, MonorepoService } from "./services/monorepo.service";
export { type PreviewOptions, type PreviewResult, PreviewService } from "./services/preview.service";
export { type PublishResult, type Registry, type RegistryConfig, RegistryService } from "./services/registry.service";

// Export utils
export {
	compareVersions,
	formatVersion,
	incrementVersion,
	isValidVersion,
	parseVersion,
	type Version,
} from "./utils/index";

// Export config
export { createReleaseConfig, defaultReleaseOptions } from "./config/index";

// Export constants
export { COMMIT_TYPES, RELEASE_STEPS } from "./constant/index";

// Export components
export {
	formatDryRunMessage,
	formatErrorMessage,
	formatStepComplete,
	formatSuccessMessage,
	formatVersionDisplay,
	formatWarningMessage,
} from "./components/index";

// Main release service
export { release } from "./services/release.service";

// Application layer
export { createReleaseApp, type ReleaseApp } from "./app";

// Result type for error handling
export type { Err, Ok, Result } from "./types/result";
