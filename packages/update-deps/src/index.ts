import { OrchestratorService } from "./services/orchestrator.service";

async function main() {
	const orchestrator = new OrchestratorService();
	await orchestrator.run();
}

main().catch(error => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
