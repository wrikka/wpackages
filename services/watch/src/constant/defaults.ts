export const DEFAULT_DEBOUNCE_MS = 100;
export const DEFAULT_POLLING_INTERVAL = 100;
export const DEFAULT_STABILITY_THRESHOLD = 2000;
export const DEFAULT_DEPTH = Number.POSITIVE_INFINITY;

export const DEFAULT_IGNORED_PATTERNS = [
	"**/node_modules/**",
	"**/.git/**",
	"**/.turbo/**",
	"**/.next/**",
	"**/.nuxt/**",
	"**/.output/**",
	"**/.vercel/**",
	"**/.netlify/**",
	"**/dist/**",
	"**/build/**",
	"**/.cache/**",
	"**/.temp/**",
	"**/.tmp/**",
	"**/*.log",
	"**/.DS_Store",
	"**/Thumbs.db",
] as const;

export const WATCH_EVENT_TYPES = [
	"add",
	"change",
	"unlink",
	"addDir",
	"unlinkDir",
	"ready",
	"error",
] as const;
