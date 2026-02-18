import type { LogFormatter } from "../types";

export const jsonFormatter: LogFormatter<string> = (entry) => {
	return JSON.stringify(entry);
};
