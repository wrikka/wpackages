import type { Console } from "../types";
import type { LogFormatter } from "../types";

export const createConsoleSink = (formatter: LogFormatter<string>, console: Console) => {
	return (line: string) => {
		switch (line) {
			case "error":
				return console.error(line);
			case "warn":
				return console.warn(line);
			default:
				return console.log(line);
		}
	};
};
