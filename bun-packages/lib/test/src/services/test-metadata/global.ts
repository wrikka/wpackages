import { TestMetadataManager } from "./manager";

// Global metadata manager instance
let globalMetadataManager: TestMetadataManager | undefined;

export function createTestMetadataManager(): TestMetadataManager {
	if (!globalMetadataManager) {
		globalMetadataManager = new TestMetadataManager();
	}
	return globalMetadataManager;
}

export function getTestMetadataManager(): TestMetadataManager {
	if (!globalMetadataManager) {
		globalMetadataManager = new TestMetadataManager();
	}
	return globalMetadataManager;
}
