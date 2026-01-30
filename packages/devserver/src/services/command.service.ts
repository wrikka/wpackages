import { execSync } from "node:child_process";

export function runCommand(
	command: string,
	toolName: string,
	pluginName: string,
) {
	try {
		console.log(`[wvite:${pluginName}] Running ${toolName}: ${command}`);
		execSync(command, { stdio: "inherit" });
	} catch (error) {
		console.error(`[wvite:${pluginName}] Error running ${toolName}:`, error);
		throw new Error(`Command failed: ${command}`);
	}
}
