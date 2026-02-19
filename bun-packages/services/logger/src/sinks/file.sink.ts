import { Effect } from "effect";
import type { LogFormatter } from "../types";

export type FileSinkOptions = Readonly<{
	filePath: string;
	formatter: LogFormatter<string>;
}>;

export const createFileSink = (options: FileSinkOptions) => {
	return (line: string) =>
		Effect.tryPromise({
			try: async () => {
				const fs = await import("node:fs/promises");
				await fs.appendFile(options.filePath, `${line}\n`);
			},
			catch: (error) => new Error(`Failed to write to log file: ${error}`),
		});
};
