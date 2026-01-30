import { Effect } from "effect";
import * as Display from "./components/display";
import * as Input from "./components/input";
import * as Output from "./services/output.service";

export const components = {
	display: {
		log: (message: string) => Effect.sync(() => Output.writeLine(message)),
		table: <T extends Record<string, unknown>>(
			data: T[],
			options?: {
				columns?: { name: string; width: number; align?: "left" | "center" | "right"; render?: (item: T) => string }[];
				pagination?: { pageSize: number; currentPage: number };
			},
		) =>
			Effect.sync(() => {
				if (data.length === 0) {
					Output.writeLine("");
					return;
				}

				const maxWidth = Math.max(20, Math.min(60, process.stdout.columns - 10));
				const minWidth = 6;
				const inferredColumns = Object.keys(data[0]).map((key) => {
					const header = String(key);
					const values = data
						.slice(0, 50)
						.map((row) => String((row as Record<string, unknown>)[key] ?? ""));
					const contentMax = values.reduce((m, v) => Math.max(m, v.length), 0);
					const width = Math.max(minWidth, Math.min(maxWidth, Math.max(header.length, contentMax)));
					return { name: key, width };
				});

				const columns = options?.columns ?? inferredColumns;

				const table = Display.Table({
					columns,
					data: data as unknown as Record<string, string>[],
					pagination: options?.pagination,
				});
				Output.writeLine(table);
			}),
	},
	prompt: {
		text: (options: {
			message: string;
			placeholder?: string;
			defaultValue?: string;
			validate?: (value: string) => string | undefined;
		}) =>
			Effect.promise(async () => {
				if (!process.stdin.isTTY) {
					if (options.defaultValue !== undefined) return options.defaultValue;
					throw new Error("Non-interactive mode requires defaultValue");
				}
				return await Input.text({
					message: options.message,
					placeholder: options.placeholder,
					validate: options.validate,
				});
			}),
	},
} as const;
