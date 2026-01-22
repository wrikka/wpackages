import { BUILTIN_TEMPLATES } from "../constant";
import { BaseGenerator } from "../core/base-generator";
import { generateFiles, mergeGeneratorOptions, renderTemplateWithContext } from "../core/generator";
import type { GenerateResult, GeneratorOptions } from "../types";
import { resolveOutputPath } from "../utils";

/**
 * Code file generator (deprecated - use generateCode instead)
 */
export class CodeGenerator extends BaseGenerator {
	private readonly fileName: string;
	private readonly template: string;

	constructor(fileName: string, template?: string, options?: GeneratorOptions) {
		super(
			options ?? {
				outputDir: "./src",
			},
		);
		this.fileName = fileName;
		this.template = template ?? BUILTIN_TEMPLATES.TYPESCRIPT_FILE;
	}

	protected async getFilesToGenerate() {
		const filePath = resolveOutputPath(
			this.options.outputDir,
			this.fileName,
			this.options.caseStyle,
			".ts",
		);

		const content = this.renderTemplate(this.template);

		return [{ path: filePath, content }];
	}
}

/**
 * Generate a code file (functional approach)
 */
export const generateCode = async (
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
		fileName,
		mergedOptions.caseStyle,
		".ts",
	);

	const content = renderTemplateWithContext(
		template ?? BUILTIN_TEMPLATES.TYPESCRIPT_FILE,
		mergedOptions.variables,
	);

	return generateFiles(
		[{ path: filePath, content }],
		mergedOptions,
	);
};

/**
 * Create code file generator (deprecated - use generateCode instead)
 */
export const createCodeGenerator = (
	fileName: string,
	template?: string,
	options?: GeneratorOptions,
): CodeGenerator => {
	return new CodeGenerator(fileName, template, options);
};
