import { Effect } from "effect";
import { generateHelp } from "../components";
import type { CliConfig } from "../types";
import { parseArguments } from "../utils";
import { checkForUpdates } from "./update.service";

export const createCli = async (config: CliConfig): Promise<void> => {
	try {
		await Effect.runPromise(checkForUpdates({ name: config.name, version: config.version }));
		// eslint-disable-next-line no-unused-vars
	} catch (_error) {
		// Ignore errors from update check to not block the CLI
	}
	if (process.argv.length <= 2) {
		const { Effect } = await import("effect");
		const { runPromptMode } = await import("./prompt.service");
		await Effect.runPromise(runPromptMode(config.commands));
		return;
	}

	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		console.log(generateHelp(config));
		return;
	}

	if (process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(config.version);
		return;
	}

	try {
		const { command, args } = parseArguments(process.argv, config);

		if (config.before) {
			await config.before(args);
		}
		if (command.before) {
			await command.before(args);
		}

		if (!command.action) {
			throw new Error("Command has no action");
		}

		await Promise.resolve(command.action(args));

		if (command.after) {
			await command.after(args);
		}
		if (config.after) {
			await config.after(args);
		}
	} catch (error) {
		console.error(`[Error] Caught in createCli:`, error);
		process.exit(1);
	}
};
