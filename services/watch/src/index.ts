// Public API
export { watch } from "./watch";

// Types
export type { PerformanceStats, WatcherConfig, WatcherInstance, WatchOptions } from "./types";
export type { WatchError, WatchEvent, WatchEventType, WatchFilter, WatchHandler, WatchStats } from "./types";

// Constants (public)
export { DEFAULT_DEBOUNCE_MS, DEFAULT_DEPTH, DEFAULT_IGNORED_PATTERNS, WATCH_EVENT_TYPES } from "./constant";
