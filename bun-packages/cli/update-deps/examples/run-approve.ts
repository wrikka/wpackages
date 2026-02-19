// This file is intended to be run from the root of the package.
// This will automatically approve all updates.
// Usage: bun run examples/run-approve.ts

import { OrchestratorService } from "../src/services/orchestrator.service";

// Mock process.argv to include the --yes flag
process.argv.push("--yes");

async function main() {
	const orchestrator = new OrchestratorService();
	await orchestrator.run();
}

main().catch(error => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
