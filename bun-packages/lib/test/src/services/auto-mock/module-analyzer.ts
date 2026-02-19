import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { MockDefinition } from "./types";

export class ModuleAnalyzer {
	private mockCache = new Map<string, MockDefinition>();
	private cwd: string;

	constructor(cwd: string) {
		this.cwd = cwd;
	}

	public analyzeModule(modulePath: string, generateFromDefinition: (definitionPath: string) => string): MockDefinition {
		if (this.mockCache.has(modulePath)) {
			return this.mockCache.get(modulePath)!;
		}

		const mockDef: MockDefinition = {
			modulePath,
			autoMock: true,
		};

		try {
			const dtsPath = this.findDefinitionFile(modulePath);
			if (dtsPath && existsSync(dtsPath)) {
				mockDef.mockImplementation = generateFromDefinition(dtsPath);
			} else {
				mockDef.mockImplementation = this.generateRuntimeMock(modulePath);
			}
		} catch (error) {
			console.warn(`Failed to analyze module ${modulePath}:`, error);
			mockDef.mockImplementation = this.generateFallbackMock();
		}

		this.mockCache.set(modulePath, mockDef);
		return mockDef;
	}

	public clearCache(): void {
		this.mockCache.clear();
	}

	public getCachedModules(): string[] {
		return Array.from(this.mockCache.keys());
	}

	private findDefinitionFile(modulePath: string): string | null {
		const possiblePaths = [
			`${modulePath}.d.ts`,
			`${modulePath}/index.d.ts`,
			path.join(path.dirname(modulePath), "index.d.ts"),
		];

		for (const possiblePath of possiblePaths) {
			if (existsSync(possiblePath)) {
				return possiblePath;
			}
		}

		return null;
	}

	private generateRuntimeMock(modulePath: string): string {
		void readFileSync;
		void this.cwd;
		// This would require dynamic import and reflection
		// For now, return a basic mock
		return `// Runtime mock for ${modulePath}\nexport default {\n  // Auto-generated mock\n};\n`;
	}

	private generateFallbackMock(): string {
		return `// Fallback mock\nexport default {\n  // Fallback implementation\n};\n`;
	}
}
