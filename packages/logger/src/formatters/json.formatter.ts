import type { LogFormatter } from "../types";

export const jsonFormatter: LogFormatter<string> = (entry) => {
	const payload = entry.meta ? { ...entry, meta: entry.meta } : entry;
	return JSON.stringify(payload);
};
