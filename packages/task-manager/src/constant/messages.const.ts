/**
 * UI messages and labels
 */
export const MESSAGES = {
	HEADER: "Tasks",
	SUBTITLE: "Select a task to run",
	HELP: "←/→ or Tab to switch, ↑/↓ to select, Enter to run, Esc to exit",
	SEARCH_LABEL: "Search: ",
	NO_TASKS: "No tasks found.",
	NO_MATCHES: (query: string) => `No matches for "${query}"`,
	RUNNING_TASK: (name: string) => `Running task: ${name}`,
} as const;
