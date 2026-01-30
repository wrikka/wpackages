/**
 * Command plugin for @wpackages/devserver (no Vite coupling)
 * Executes external commands during dev server lifecycle
 */

import { runCommand } from "../services/command.service";
import type { CommandOptions } from "../types";
import type { DevServerPluginInstance } from "../types/plugin";

export function createCommandPlugin(
	name: string,
	commands: Record<string, CommandOptions> | undefined,
): DevServerPluginInstance | null {
	if (!commands) {
		return null;
	}

	return {
		name: `wdev-command-${name}`,
		version: "1.0.0",
		description: `Command plugin for ${name}`,
		hooks: {
			async configureServer() {
				console.log(`[wdev:${name}] Running commands...`);
				for (const [tool, opts] of Object.entries(commands)) {
					let command = opts.scripts;
					if (typeof opts.config === "string") {
						command = `${command} --config ${opts.config}`;
					}
					try {
						runCommand(command, tool, name);
					} catch (error: unknown) {
						const message = error instanceof Error ? error.message : String(error);
						console.error(`[wdev:${name}] Error running ${tool}:`, message);
					}
				}
			},
		},
	};
}
