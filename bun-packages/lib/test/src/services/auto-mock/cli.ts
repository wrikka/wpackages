import { AutoMockGenerator } from "./generator";

// CLI function to generate mocks
export function generateMocks(options: {
	modules: string[];
	outputDir?: string;
	config?: boolean;
}): void {
	const generator = getAutoMockGenerator();

	if (options.config) {
		generator.generateMockConfig(options.modules);
	}

	generator.generateMocksForModules(options.modules, options.outputDir);

	console.log(`Generated mocks for ${options.modules.length} modules`);
}

// Global auto-mock generator instance
let globalAutoMockGenerator: AutoMockGenerator | undefined;

export function createAutoMockGenerator(cwd: string): AutoMockGenerator {
	if (!globalAutoMockGenerator) {
		globalAutoMockGenerator = new AutoMockGenerator(cwd);
	}
	return globalAutoMockGenerator;
}

export function getAutoMockGenerator(): AutoMockGenerator {
	if (!globalAutoMockGenerator) {
		globalAutoMockGenerator = new AutoMockGenerator(process.cwd());
	}
	return globalAutoMockGenerator;
}
