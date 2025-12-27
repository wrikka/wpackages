import { BUILTIN_TEMPLATES } from "../constant";
import { BaseGenerator } from "../core/base-generator";
import { generateFiles, mergeGeneratorOptions, renderTemplateWithContext } from "../core/generator";
import type { GenerateResult, GeneratorOptions } from "../types";
import { resolveOutputPath } from "../utils";

/**
 * Test file generator (deprecated - use generateTest instead)
 */
export class TestGenerator extends BaseGenerator {
	private readonly fileName: string;
	private readonly template: string;

	constructor(fileName: string, template?: string, options?: GeneratorOptions) {
		super(
			options ?? {
				outputDir: "./src",
			},
		);
		this.fileName = fileName;
		this.template = template ?? BUILTIN_TEMPLATES.TEST_FILE;
	}

	protected async getFilesToGenerate() {
		const filePath = resolveOutputPath(
			this.options.outputDir,
			`${this.fileName}.test`,
			this.options.caseStyle,
			".ts",
		);

		const content = this.renderTemplate(this.template);

		return [{ path: filePath, content }];
	}
}

/**
 * Generate a test file (functional approach)
 */
export const generateTest = async (
	fileName: string,
	template?: string,
	options?: GeneratorOptions,
): Promise<GenerateResult> => {
	const mergedOptions = mergeGeneratorOptions(
		options ?? {
			outputDir: "./src",
		},
	);

	const filePath = resolveOutputPath(
		mergedOptions.outputDir,
		`${fileName}.test`,
		mergedOptions.caseStyle,
		".ts",
	);

	const content = renderTemplateWithContext(
		template ?? BUILTIN_TEMPLATES.TEST_FILE,
		mergedOptions.variables,
	);

	return generateFiles(
		[{ path: filePath, content }],
		mergedOptions,
	);
};

/**
 * Create test file generator (deprecated - use generateTest instead)
 */
export const createTestGenerator = (
	fileName: string,
	template?: string,
	options?: GeneratorOptions,
): TestGenerator => {
	return new TestGenerator(fileName, template, options);
};
