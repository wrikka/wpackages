// This file is intended to be run from the root of the package.
// Usage: bun run examples/run.ts

import { OrchestratorService } from "../src/services/orchestrator.service";

async function main() {
	const orchestrator = new OrchestratorService();
	await orchestrator.run();
}

main().catch(error => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
