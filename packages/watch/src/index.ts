// Public API
export { watch } from "./watch";

// Types
export type {
	WatcherConfig,
	WatcherInstance,
	WatchOptions,
	PerformanceStats,
} from "./types";
export type {
	WatchEvent,
	WatchEventType,
	WatchError,
	WatchHandler,
	WatchFilter,
	WatchStats,
} from "./types";

// Constants (public)
export {
	DEFAULT_DEBOUNCE_MS,
	DEFAULT_DEPTH,
	DEFAULT_IGNORED_PATTERNS,
	WATCH_EVENT_TYPES,
} from "./constant";
