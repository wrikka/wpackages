import { BuildOrchestrator } from "./services/bunpack/orchestrator.service";
import type { BunpackConfig } from "./types";

export { defineConfig } from "./types";
export { BuildOrchestrator };

export async function build(inlineConfig: Partial<BunpackConfig> = {}) {
    const orchestrator = await BuildOrchestrator.create(inlineConfig);
    await orchestrator.build();
}
