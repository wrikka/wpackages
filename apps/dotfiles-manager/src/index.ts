#!/usr/bin/env bun
import { runCommander } from "./app/command";
import { runDotfilesManager } from "./app/interactive";

async function main() {
	try {
		if (process.argv.length > 2) {
			await runCommander();
		} else {
			await runDotfilesManager();
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error:", error.message);
		}
		process.exit(1);
	}
}

main();
