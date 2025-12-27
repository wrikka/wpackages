import { BUILTIN_TEMPLATES } from "../constant";
import { BaseGenerator } from "../core/base-generator";
import { generateFiles, mergeGeneratorOptions, renderTemplateWithContext } from "../core/generator";
import type { GenerateResult, GeneratorOptions } from "../types";
import { resolveDirectoryPath, resolveOutputPath } from "../utils";

/**
 * Module generator options
 */
export interface ModuleGeneratorOptions extends GeneratorOptions {
	/** Generate test files */
	readonly withTests?: boolean;
	/** Generate usage examples */
	readonly withUsage?: boolean;
	/** Generate index file */
	readonly withIndex?: boolean;
}

/**
 * Module generator - creates complete module structure (deprecated - use generateModule instead)
 */
export class ModuleGenerator extends BaseGenerator {
	private readonly moduleName: string;
	private readonly withTests: boolean;
	private readonly withUsage: boolean;
	private readonly withIndex: boolean;

	constructor(moduleName: string, options?: ModuleGeneratorOptions) {
		super(
			options ?? {
				outputDir: "./src",
			},
		);
		this.moduleName = moduleName;
		this.withTests = options?.withTests ?? true;
		this.withUsage = options?.withUsage ?? true;
		this.withIndex = options?.withIndex ?? true;
	}

	protected async getFilesToGenerate() {
		const files: Array<{
			path: string;
			content: string;
		}> = [];

		const moduleDir = resolveDirectoryPath(
			this.options.outputDir,
			this.moduleName,
		);

		// Main module file
		const mainPath = resolveOutputPath(
			moduleDir,
			this.moduleName,
			this.options.caseStyle,
			".ts",
		);
		files.push({
			path: mainPath,
			content: this.renderTemplate(BUILTIN_TEMPLATES.TYPESCRIPT_FILE),
		});

		// Test file
		if (this.withTests) {
			const testPath = resolveOutputPath(
				moduleDir,
				`${this.moduleName}.test`,
				this.options.caseStyle,
				".ts",
			);
			files.push({
				path: testPath,
				content: this.renderTemplate(BUILTIN_TEMPLATES.TEST_FILE),
			});
		}

		// Usage file
		if (this.withUsage) {
			const usagePath = resolveOutputPath(
				moduleDir,
				`${this.moduleName}.usage`,
				this.options.caseStyle,
				".ts",
			);
			files.push({
				path: usagePath,
				content: this.renderTemplate(BUILTIN_TEMPLATES.USAGE_FILE),
			});
		}

		// Index file
		if (this.withIndex) {
			const indexPath = resolveOutputPath(moduleDir, "index", "kebab", ".ts");
			const indexContent = this.generateIndexContent();
			files.push({
				path: indexPath,
				content: indexContent,
			});
		}

		return files;
	}

	private generateIndexContent(): string {
		const template = `export * from "./{{ kebab name }}"\n`;
		return this.renderTemplate(template);
	}
}

/**
 * Generate a module (functional approach)
 */
export const generateModule = async (
	moduleName: string,
	options?: ModuleGeneratorOptions,
): Promise<GenerateResult> => {
	const mergedOptions = mergeGeneratorOptions(
		options ?? {
			outputDir: "./src",
		},
	);

	const withTests = options?.withTests ?? true;
	const withUsage = options?.withUsage ?? true;
	const withIndex = options?.withIndex ?? true;

	const files: Array<{
		path: string;
		content: string;
	}> = [];

	const moduleDir = resolveDirectoryPath(
		mergedOptions.outputDir,
		moduleName,
	);

	// Main module file
	const mainPath = resolveOutputPath(
		moduleDir,
		moduleName,
		mergedOptions.caseStyle,
		".ts",
	);
	files.push({
		path: mainPath,
		content: renderTemplateWithContext(BUILTIN_TEMPLATES.TYPESCRIPT_FILE, mergedOptions.variables),
	});

	// Test file
	if (withTests) {
		const testPath = resolveOutputPath(
			moduleDir,
			`${moduleName}.test`,
			mergedOptions.caseStyle,
			".ts",
		);
		files.push({
			path: testPath,
			content: renderTemplateWithContext(BUILTIN_TEMPLATES.TEST_FILE, mergedOptions.variables),
		});
	}

	// Usage file
	if (withUsage) {
		const usagePath = resolveOutputPath(
			moduleDir,
			`${moduleName}.usage`,
			mergedOptions.caseStyle,
			".ts",
		);
		files.push({
			path: usagePath,
			content: renderTemplateWithContext(BUILTIN_TEMPLATES.USAGE_FILE, mergedOptions.variables),
		});
	}

	// Index file
	if (withIndex) {
		const indexPath = resolveOutputPath(moduleDir, "index", "kebab", ".ts");
		const indexContent = renderTemplateWithContext(
			`export * from "./{{ kebab name }}"\n`,
			mergedOptions.variables,
		);
		files.push({
			path: indexPath,
			content: indexContent,
		});
	}

	return generateFiles(files, mergedOptions);
};

/**
 * Create module generator (deprecated - use generateModule instead)
 */
export const createModuleGenerator = (
	moduleName: string,
	options?: ModuleGeneratorOptions,
): ModuleGenerator => {
	return new ModuleGenerator(moduleName, options);
};
