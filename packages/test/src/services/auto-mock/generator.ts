import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { generateMockCode } from "./codegen";
import { ModuleAnalyzer } from "./module-analyzer";
import { TypeDefinitionParser } from "./type-parser";
import type { MockDefinition, TypeDefinition } from "./types";

export class AutoMockGenerator {
	private typeCache = new Map<string, TypeDefinition>();
	private cwd: string;
	private parser: TypeDefinitionParser;
	private moduleAnalyzer: ModuleAnalyzer;

	constructor(cwd: string) {
		this.cwd = cwd;
		this.parser = new TypeDefinitionParser();
		this.moduleAnalyzer = new ModuleAnalyzer(cwd);
	}

	// Generate mock from TypeScript definition file
	public generateMockFromDefinition(definitionPath: string): string {
		const cached = this.typeCache.get(definitionPath);
		if (cached) {
			return generateMockCode(cached);
		}

		const content = readFileSync(definitionPath, "utf8");
		const typeDef = this.parser.parseTypeDefinition(content);
		this.typeCache.set(definitionPath, typeDef);
		return generateMockCode(typeDef);
	}

	// Generate mock from module by inspecting its exports
	public generateMockFromModule(modulePath: string): string {
		const mockDef = this.analyzeModule(modulePath);
		return this.generateMockFromDefinition(mockDef);
	}

	// Analyze existing module to create mock definition
	public analyzeModule(modulePath: string): MockDefinition {
		return this.moduleAnalyzer.analyzeModule(
			modulePath,
			(definitionPath) => this.generateMockFromDefinition(definitionPath),
		);
	}

	public saveMock(mockDef: MockDefinition, outputPath: string): void {
		const fullPath = path.resolve(this.cwd, outputPath);
		const dir = path.dirname(fullPath);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(fullPath, mockDef.mockImplementation || "", "utf8");
	}

	// Generate mocks for multiple modules
	public generateMocksForModules(modulePaths: string[], outputDir = "__mocks__"): void {
		for (const modulePath of modulePaths) {
			const mockDef = this.analyzeModule(modulePath);
			const outputPath = path.join(outputDir, `${path.basename(modulePath)}.mock.ts`);
			this.saveMock(mockDef, outputPath);
		}
	}

	// Generate mock configuration file
	public generateMockConfig(modulePaths: string[], outputPath = "mock.config.ts"): void {
		const config = {
			modulePaths,
			generatedAt: new Date().toISOString(),
			version: "1.0.0",
		};

		const configContent = `// Auto-generated mock configuration\nexport const mockConfig = ${
			JSON.stringify(config, null, 2)
		};\n`;
		const fullPath = path.resolve(this.cwd, outputPath);

		writeFileSync(fullPath, configContent, "utf8");
	}

	public clearCache(): void {
		this.typeCache.clear();
		this.moduleAnalyzer.clearCache();
	}

	public getCacheStats(): {
		typeCacheSize: number;
		mockCacheSize: number;
		cachedModules: string[];
	} {
		const cachedModules = this.moduleAnalyzer.getCachedModules();
		return {
			typeCacheSize: this.typeCache.size,
			mockCacheSize: cachedModules.length,
			cachedModules,
		};
	}
}
