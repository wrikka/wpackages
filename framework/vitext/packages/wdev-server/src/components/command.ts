import type { PluginOption } from "vite";
import { runCommand } from "../services/command.service";
import type { CommandOptions } from "../types";

export function createCommandPlugin(
	name: string,
	commands: Record<string, CommandOptions> | undefined,
): PluginOption | null {
	if (!commands) {
		return null;
	}

	return {
		buildStart() {
			console.log(`[wvite:${name}] Running commands...`);
			for (const [tool, opts] of Object.entries(commands)) {
				let command = opts.scripts;
				if (typeof opts.config === "string") {
					command = `${command} --config ${opts.config}`;
				}
				try {
					runCommand(command, tool, name);
				} catch (error: unknown) {
					if (error instanceof Error) {
						this.error(error.message);
					} else {
						this.error(String(error));
					}
				}
			}
		},
		name: `vite-plugin-wvite-${name}`,
	};
}
