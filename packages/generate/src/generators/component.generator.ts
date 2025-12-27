import { BUILTIN_TEMPLATES } from "../constant";
import { BaseGenerator } from "../core/base-generator";
import { generateFiles, mergeGeneratorOptions, renderTemplateWithContext } from "../core/generator";
import type { GenerateResult, GeneratorOptions } from "../types";
import { resolveOutputPath } from "../utils";

type ComponentFramework = "react" | "vue";

/**
 * Component generator options
 */
export interface ComponentGeneratorOptions extends GeneratorOptions {
	/** Framework to use */
	readonly framework?: ComponentFramework;
	/** Generate test file */
	readonly withTest?: boolean;
	/** Generate usage example */
	readonly withUsage?: boolean;
}

/**
 * Component file generator (deprecated - use generateComponent instead)
 */
export class ComponentGenerator extends BaseGenerator {
	private readonly componentName: string;
	private readonly framework: ComponentFramework;
	private readonly withTest: boolean;
	private readonly withUsage: boolean;

	constructor(componentName: string, options?: ComponentGeneratorOptions) {
		super(
			options ?? {
				outputDir: "./src/components",
			},
		);
		this.componentName = componentName;
		this.framework = options?.framework ?? "react";
		this.withTest = options?.withTest ?? true;
		this.withUsage = options?.withUsage ?? false;
	}

	protected async getFilesToGenerate() {
		const files: Array<{
			path: string;
			content: string;
		}> = [];

		// Component file
		const ext = this.framework === "react" ? ".tsx" : ".vue";
		const componentPath = resolveOutputPath(
			this.options.outputDir,
			this.componentName,
			this.options.caseStyle,
			ext,
		);

		const template = this.framework === "react"
			? BUILTIN_TEMPLATES.REACT_COMPONENT
			: BUILTIN_TEMPLATES.VUE_COMPONENT;

		files.push({
			path: componentPath,
			content: this.renderTemplate(template),
		});

		// Test file
		if (this.withTest) {
			const testPath = resolveOutputPath(
				this.options.outputDir,
				`${this.componentName}.test`,
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
				this.options.outputDir,
				`${this.componentName}.usage`,
				this.options.caseStyle,
				ext,
			);

			files.push({
				path: usagePath,
				content: this.renderTemplate(BUILTIN_TEMPLATES.USAGE_FILE),
			});
		}

		return files;
	}
}

/**
 * Generate a component (functional approach)
 */
export const generateComponent = async (
	componentName: string,
	options?: ComponentGeneratorOptions,
): Promise<GenerateResult> => {
	const mergedOptions = mergeGeneratorOptions(
		options ?? {
			outputDir: "./src/components",
		},
	);

	const framework = options?.framework ?? "react";
	const withTest = options?.withTest ?? true;
	const withUsage = options?.withUsage ?? false;

	const files: Array<{
		path: string;
		content: string;
	}> = [];

	// Component file
	const ext = framework === "react" ? ".tsx" : ".vue";
	const componentPath = resolveOutputPath(
		mergedOptions.outputDir,
		componentName,
		mergedOptions.caseStyle,
		ext,
	);

	const template = framework === "react"
		? BUILTIN_TEMPLATES.REACT_COMPONENT
		: BUILTIN_TEMPLATES.VUE_COMPONENT;

	files.push({
		path: componentPath,
		content: renderTemplateWithContext(template, mergedOptions.variables),
	});

	// Test file
	if (withTest) {
		const testPath = resolveOutputPath(
			mergedOptions.outputDir,
			`${componentName}.test`,
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
			mergedOptions.outputDir,
			`${componentName}.usage`,
			mergedOptions.caseStyle,
			ext,
		);

		files.push({
			path: usagePath,
			content: renderTemplateWithContext(BUILTIN_TEMPLATES.USAGE_FILE, mergedOptions.variables),
		});
	}

	return generateFiles(files, mergedOptions);
};

/**
 * Create component generator (deprecated - use generateComponent instead)
 */
export const createComponentGenerator = (
	componentName: string,
	options?: ComponentGeneratorOptions,
): ComponentGenerator => {
	return new ComponentGenerator(componentName, options);
};
