import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { DEFAULT_GENERATOR_OPTIONS } from "../constant";
import type { GenerateResult, GeneratorOptions, GeneratorResult, TemplateContext } from "../types";
import { createTemplateHelpers, getDirectoryPath, renderTemplate } from "../utils";

/**
 * Merge generator options with defaults
 */
export const mergeGeneratorOptions = (
	options?: GeneratorOptions,
): Required<GeneratorOptions> => {
	const merged = {
		...DEFAULT_GENERATOR_OPTIONS,
		...options,
	};
	return merged as Required<GeneratorOptions>;
};

/**
 * Create error object from unknown error
 */
const createErrorObject = (
	path: string,
	error: unknown,
): {
	path: string;
	message: string;
	error?: Error;
} => {
	if (error instanceof Error) {
		return {
			path,
			message: error.message,
			error,
		};
	}
	return {
		path,
		message: "Unknown error",
	};
};

/**
 * Generate a single file
 */
export const generateFile = async (
	filePath: string,
	content: string,
	options: Required<GeneratorOptions>,
): Promise<GeneratorResult> => {
	const fileExists = existsSync(filePath);
	const warnings: string[] = [];

	if (fileExists && !options.overwrite) {
		warnings.push(
			`File already exists and overwrite is disabled: ${filePath}`,
		);
		return {
			path: filePath,
			content,
			created: false,
			warnings,
		};
	}

	if (options.dryRun) {
		warnings.push("Dry run mode: file not written");
		return {
			path: filePath,
			content,
			created: false,
			warnings,
		};
	}

	// Create directory if needed
	const dir = getDirectoryPath(filePath);
	await mkdir(dir, { recursive: true });

	// Write file
	await writeFile(filePath, content, "utf-8");

	return {
		path: filePath,
		content,
		created: !fileExists,
		warnings,
	};
};

/**
 * Generate multiple files
 */
export const generateFiles = async (
	files: Array<{
		path: string;
		content: string;
		shouldOverwrite?: boolean;
	}>,
	options: Required<GeneratorOptions>,
): Promise<GenerateResult> => {
	const startTime = Date.now();
	const results: GeneratorResult[] = [];
	const errors: Array<{
		path: string;
		message: string;
		error?: Error;
	}> = [];

	try {
		for (const file of files) {
			try {
				const result = await generateFile(
					file.path,
					file.content,
					{
						...options,
						overwrite: file.shouldOverwrite ?? options.overwrite,
					},
				);
				results.push(result);
			} catch (error) {
				errors.push(createErrorObject(file.path, error));
			}
		}
	} catch (error) {
		errors.push(createErrorObject("unknown", error));
	}

	return {
		files: results,
		errors,
		duration: Date.now() - startTime,
	};
};

/**
 * Render template with context
 */
export const renderTemplateWithContext = (
	template: string,
	variables: Record<string, unknown>,
): string => {
	const context: TemplateContext = {
		variables,
		helpers: createTemplateHelpers(),
	};

	return renderTemplate(template, context);
};
