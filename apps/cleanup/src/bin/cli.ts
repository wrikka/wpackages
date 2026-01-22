#!/usr/bin/env node
import { handleInit, runCleanupApp } from "../app";

const main = async () => {
	const args = process.argv.slice(2);

	if (args.includes("init")) {
		await handleInit();
	} else {
		const dryRun = args.includes("--dry-run");
		const skipConfirmation = args.includes("--yes") || args.includes("-y");
		await runCleanupApp({ dryRun, skipConfirmation });
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
