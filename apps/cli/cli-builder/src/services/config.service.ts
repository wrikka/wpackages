import { Schema } from "@effect/schema";
import { loadConfig } from "@wpackages/config-manager";
import { Effect } from "effect";
import { findUp } from "find-up";
import { config as defaultConfig } from "../config/cli.config";
import type { CliConfig } from "../types";
import { CommandSchema } from "../types/schema";
import { loadPlugins } from "./plugin.service";

const CliConfigSchema = Schema.Struct({
	name: Schema.String,
	version: Schema.String,
	commands: Schema.Array(CommandSchema),
	before: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
	after: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
});

const getProjectName = Effect.tryPromise({
	try: async () => {
		const packageJsonPath = await findUp("package.json");
		if (!packageJsonPath) {
			// Fallback to default if no package.json is found
			return defaultConfig.name;
		}
		const packageJson = await Bun.file(packageJsonPath).json();
		const projectName = packageJson.name;
		if (!projectName || typeof projectName !== "string") {
			throw new Error("The 'name' field in package.json is missing or invalid.");
		}
		// remove scope if present
		const name = projectName.split("/").pop();
		return name || defaultConfig.name;
	},
	catch: (error: unknown) => new Error(`Failed to get project name: ${String(error)}`),
});

export const loadCliConfig = (): Effect.Effect<CliConfig, Error> =>
	getProjectName.pipe(
		Effect.flatMap(projectName =>
			Effect.tryPromise({
				try: async () => {
					const { config: loadedConfig } = await loadConfig<CliConfig>({
						name: projectName,
						defaultConfig: defaultConfig,
					});
					return loadedConfig;
				},
				catch: (error: unknown) => new Error(`Failed to load configuration file: ${String(error)}`),
			})
		),
		Effect.flatMap(mergedConfig =>
			Schema.decodeUnknown(CliConfigSchema)(mergedConfig).pipe(
				Effect.mapError(
					parseError => new Error(`Invalid configuration: ${JSON.stringify(parseError, null, 2)}`),
				),
			)
		),
		Effect.flatMap(loadPlugins),
	);
