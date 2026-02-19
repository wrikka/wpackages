import type { LogConsole, LogEntry } from "../types";

export const createConsoleSink = (console: LogConsole) => {
	return (entry: LogEntry) => {
		switch (entry.level) {
			case "error":
				return console.error(JSON.stringify(entry));
			case "warn":
				return console.warn(JSON.stringify(entry));
			default:
				return console.log(JSON.stringify(entry));
		}
	};
};
