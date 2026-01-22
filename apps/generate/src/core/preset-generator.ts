import { generateCode } from "../generators/code.generator";
import { type ComponentGeneratorOptions, generateComponent } from "../generators/component.generator";
import { generateModule, type ModuleGeneratorOptions } from "../generators/module.generator";
import { generateTest } from "../generators/test.generator";
import type { GenerateResult, GeneratorOptions } from "../types";

/**
 * Preset configuration for common patterns
 */
export interface PresetConfig {
	name: string;
	description: string;
	files: {
		type: "code" | "component" | "module" | "test";
		name: string;
		template?: string;
		options?: Partial<GeneratorOptions & ComponentGeneratorOptions & ModuleGeneratorOptions>;
	}[];
}

/**
 * Generate from preset configuration
 */
export const generateFromPreset = async (
	preset: PresetConfig,
	options?: GeneratorOptions,
): Promise<GenerateResult> => {
	const results: GenerateResult[] = [];

	for (const file of preset.files) {
		try {
			let result: GenerateResult;

			const mergedOptions = {
				...options,
				...file.options,
			} as GeneratorOptions & ComponentGeneratorOptions & ModuleGeneratorOptions;

			switch (file.type) {
				case "code":
					result = await generateCode(file.name, file.template, mergedOptions as GeneratorOptions);
					break;
				case "component":
					result = await generateComponent(file.name, mergedOptions as ComponentGeneratorOptions);
					break;
				case "module":
					result = await generateModule(file.name, mergedOptions as ModuleGeneratorOptions);
					break;
				case "test":
					result = await generateTest(file.name, file.template, mergedOptions as GeneratorOptions);
					break;
				default:
					// This should be unreachable due to the discriminated union type
					// This ensures all cases are handled at compile time
					// This ensures all cases are handled at compile time
					const _exhaustiveCheck: never = file.type;
					throw new Error("Unhandled file type encountered. This should not happen.");
			}

			results.push(result);
		} catch (error) {
			console.error(`Failed to generate ${file.name}:`, error);
		}
	}

	// Merge all results
	const mergedResult: GenerateResult = {
		files: results.flatMap(r => r.files),
		errors: results.flatMap(r => r.errors),
		duration: results.reduce((sum, r) => sum + r.duration, 0),
	};

	return mergedResult;
};

/**
 * Built-in presets
 */
export const PRESETS = {
	REACT_COMPONENT: {
		name: "React Component",
		description: "Generate a complete React component with test and usage",
		files: [
			{
				type: "component",
				name: "Component",
				options: {
					framework: "react",
					withTest: true,
					withUsage: true,
				},
			},
		],
	} as PresetConfig,

	VUE_COMPONENT: {
		name: "Vue Component",
		description: "Generate a complete Vue component with test and usage",
		files: [
			{
				type: "component",
				name: "Component",
				options: {
					framework: "vue",
					withTest: true,
					withUsage: true,
				},
			},
		],
	} as PresetConfig,

	FULL_MODULE: {
		name: "Full Module",
		description: "Generate a complete module with main file, test, usage, and index",
		files: [
			{
				type: "module",
				name: "module",
				options: {
					withTests: true,
					withUsage: true,
					withIndex: true,
				},
			},
		],
	} as PresetConfig,

	SERVICE_LAYER: {
		name: "Service Layer",
		description: "Generate a service with implementation, test, and usage",
		files: [
			{
				type: "code",
				name: "service",
			},
			{
				type: "test",
				name: "service",
			},
		],
	} as PresetConfig,
};
