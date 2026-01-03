import { array, boolean, number, object, string, union } from "@wpackages/schema";

// Schema for the main configuration file (e.g., bench.json)
export const configSchema = object({
	shape: {
		warmup: number().optional(),
		runs: number().optional(),
		concurrency: number().optional(),
		prepare: string().optional(),
		cleanup: string().optional(),
		shell: string().optional(),
		output: union([
			string().literal("json"),
			string().literal("text"),
			string().literal("table"),
			string().literal("chart"),
			string().literal("histogram"),
			string().literal("boxplot"),
		]).optional(),
		export: string().optional(),
		verbose: boolean().optional(),
		silent: boolean().optional(),
		htmlReport: string().optional(),
		parameterScan: object({
			shape: {
				parameter: string(),
				values: array({ item: string() }),
			},
		}).optional(),
		commands: array({ item: string() }).optional(),
		plugins: array({ item: string() }).optional(),
	},
});
