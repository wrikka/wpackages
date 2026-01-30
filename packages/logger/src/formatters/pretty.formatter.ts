import type { LogFormatter } from "../types";
import type { LogEntry } from "../types";

const LEVEL_COLORS: Record<string, string> = {
	debug: "\x1b[36m",
	info: "\x1b[32m",
	warn: "\x1b[33m",
	error: "\x1b[31m",
};

const RESET = "\x1b[0m";

const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toISOString();
};

export const prettyFormatter: LogFormatter<string> = (entry: LogEntry) => {
	const color = LEVEL_COLORS[entry.level] || RESET;
	const level = entry.level.toUpperCase().padEnd(5);
	const time = formatDate(entry.timestamp);
	const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
	return `${color}[${time}] ${level}${RESET} ${entry.message}${metaStr}`;
};
