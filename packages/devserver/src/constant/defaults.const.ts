export const DEFAULT_PORT = 3000;
export const DEFAULT_HOSTNAME = "localhost";
export const DEFAULT_ROOT = process.cwd();
export const DEFAULT_DEBOUNCE_MS = 100;
export const DEFAULT_CACHE_TTL = 300000; // 5 minutes
export const DEFAULT_IGNORED_PATTERNS = [
	"**/node_modules/**",
	"**/.git/**",
	"**/dist/**",
	"**/.cache/**",
] as const;
