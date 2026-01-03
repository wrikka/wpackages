#!/usr/bin/env node
import { handleInit, runCleanupApp } from "../app";

const main = async () => {
	const args = process.argv.slice(2);

	if (args.includes("init")) {
		await handleInit();
	} else {
		await runCleanupApp();
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
