/**
 * Grouped logging with automatic source location.
 * Groups multiple log statements under a single label.
 *
 * @param label - The group label
 * @param fn - Function containing log statements
 *
 * @example
 * log.group("User Processing", () => {
 *   log.debug("Loading user:", userId);
 *   log.info("Processing...");
 * });
 */
export const group = Bun.macro((label: string, fn: () => void) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.group("[${path}:${line}] ${label}"); ${String(fn)}(); console.groupEnd();`;
});
