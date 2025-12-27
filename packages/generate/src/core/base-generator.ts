import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { DEFAULT_GENERATOR_OPTIONS } from "../constant";
import type { GenerateResult, GeneratorOptions, GeneratorResult, TemplateContext } from "../types";
import { createTemplateHelpers, getDirectoryPath, renderTemplate } from "../utils";

/**
 * Base generator class
 */
export abstract class BaseGenerator {
	protected readonly options: Required<GeneratorOptions>;

	constructor(options: GeneratorOptions) {
		this.options = {
			...DEFAULT_GENERATOR_OPTIONS,
			...options,
		};
	}

	/**
	 * Generate files based on templates
	 */
	async generate(): Promise<GenerateResult> {
		const startTime = Date.now();
		const results: GeneratorResult[] = [];
		const errors: Array<{
			path: string;
			message: string;
			error?: Error;
		}> = [];

		try {
			const files = await this.getFilesToGenerate();

			for (const file of files) {
				try {
					const result = await this.generateFile(
						file.path,
						file.content,
						file.shouldOverwrite ?? this.options.overwrite,
					);
					results.push(result);
				} catch (error) {
					if (error instanceof Error) {
						errors.push({
							path: file.path,
							message: error.message,
							error,
						});
					} else {
						errors.push({
							path: file.path,
							message: "Unknown error",
						});
					}
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				errors.push({
					path: "unknown",
					message: error.message,
					error,
				});
			} else {
				errors.push({
					path: "unknown",
					message: "Unknown error",
				});
			}
		}

		return {
			files: results,
			errors,
			duration: Date.now() - startTime,
		};
	}

	/**
	 * Get files to generate (implement in subclass)
	 */
	protected abstract getFilesToGenerate(): Promise<
		Array<{
			path: string;
			content: string;
			shouldOverwrite?: boolean;
		}>
	>;

	/**
	 * Generate a single file
	 */
	protected async generateFile(
		filePath: string,
		content: string,
		shouldOverwrite: boolean,
	): Promise<GeneratorResult> {
		const fileExists = existsSync(filePath);
		const warnings: string[] = [];

		if (fileExists && !shouldOverwrite) {
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

		if (this.options.dryRun) {
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
	}

	/**
	 * Render template with context
	 */
	protected renderTemplate(template: string): string {
		const context: TemplateContext = {
			variables: this.options.variables,
			helpers: createTemplateHelpers(),
		};

		return renderTemplate(template, context);
	}
}
