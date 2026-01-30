import { extractClasses } from "./class-extractor.service";
import { extractAttributes } from "./attribute-extractor.service";

export interface ComponentDefinition {
	readonly name: string;
	readonly classes: Set<string>;
	readonly attributes: Set<string>;
	readonly files: string[];
	readonly variants?: Record<string, Set<string>>;
}

export interface ComponentExtractorOptions {
	readonly componentPrefix?: string;
	readonly extractVariants?: boolean;
	readonly minFiles?: number;
}

export function extractComponents(
	code: string,
	filePath: string,
	options: ComponentExtractorOptions = {},
): ComponentDefinition[] {
	const { componentPrefix = "c-", extractVariants = true } = options;
	const components: Map<string, ComponentDefinition> = new Map();

	const classes = extractClasses(code);
	const attributes = extractAttributes(code);

	for (const cls of classes) {
		if (cls.startsWith(componentPrefix)) {
			const componentName = cls.substring(componentPrefix.length);

			if (!components.has(componentName)) {
				components.set(componentName, {
					name: componentName,
					classes: new Set(),
					attributes: new Set(),
					files: [],
					variants: extractVariants ? {} : undefined,
				});
			}

			const component = components.get(componentName)!;
			component.classes.add(cls);

			if (extractVariants) {
				const variantMatch = cls.match(new RegExp(`^${componentPrefix}([a-z0-9-]+)--([a-z0-9-]+)$`));
				if (variantMatch) {
					const [, name, variant] = variantMatch;
					if (name === componentName) {
						if (!component.variants![variant]) {
							component.variants![variant] = new Set();
						}
						component.variants![variant].add(cls);
					}
				}
			}
		}
	}

	for (const attr of attributes) {
		if (attr.startsWith(componentPrefix)) {
			const componentName = attr.substring(componentPrefix.length);

			if (!components.has(componentName)) {
				components.set(componentName, {
					name: componentName,
					classes: new Set(),
					attributes: new Set(),
					files: [],
					variants: extractVariants ? {} : undefined,
				});
			}

			const component = components.get(componentName)!;
			component.attributes.add(attr);
		}
	}

	for (const component of components.values()) {
		component.files.push(filePath);
	}

	return Array.from(components.values());
}

export function mergeComponentDefinitions(
	definitions: ComponentDefinition[],
	options: ComponentExtractorOptions = {},
): ComponentDefinition[] {
	const { minFiles = 1 } = options;
	const merged: Map<string, ComponentDefinition> = new Map();

	for (const def of definitions) {
		if (!merged.has(def.name)) {
			merged.set(def.name, {
				...def,
				classes: new Set(def.classes),
				attributes: new Set(def.attributes),
				files: [...def.files],
				variants: def.variants
					? Object.fromEntries(
							Object.entries(def.variants).map(([k, v]) => [k, new Set(v)]),
						)
					: undefined,
			});
		} else {
			const existing = merged.get(def.name)!;

			for (const cls of def.classes) {
				existing.classes.add(cls);
			}

			for (const attr of def.attributes) {
				existing.attributes.add(attr);
			}

			for (const file of def.files) {
				if (!existing.files.includes(file)) {
					existing.files.push(file);
				}
			}

			if (existing.variants && def.variants) {
				for (const [variant, classes] of Object.entries(def.variants)) {
					if (!existing.variants[variant]) {
						existing.variants[variant] = new Set();
					}
					for (const cls of classes) {
						existing.variants[variant].add(cls);
					}
				}
			}
		}
	}

	return Array.from(merged.values()).filter(comp => comp.files.length >= minFiles);
}

export function generateComponentCss(components: ComponentDefinition[]): string {
	const cssParts: string[] = [];

	for (const component of components) {
		const baseClasses = [...component.classes].filter(
			cls => !cls.includes("--"),
		);

		if (baseClasses.length > 0) {
			cssParts.push(`/* Component: ${component.name} */`);
			cssParts.push(`.${component.name} {`);
			cssParts.push(`  /* Classes: ${baseClasses.join(", ")} */`);
			cssParts.push(`}`);

			if (component.variants) {
				for (const [variant, variantClasses] of Object.entries(component.variants)) {
					cssParts.push(`.${component.name}--${variant} {`);
					cssParts.push(`  /* Classes: ${[...variantClasses].join(", ")} */`);
					cssParts.push(`}`);
				}
			}

			cssParts.push("");
		}
	}

	return cssParts.join("\n");
}

export function getComponentUsageStats(
	components: ComponentDefinition[],
): Record<string, { files: number; classes: number; variants: number }> {
	const stats: Record<string, { files: number; classes: number; variants: number }> = {};

	for (const component of components) {
		stats[component.name] = {
			files: component.files.length,
			classes: component.classes.size,
			variants: component.variants ? Object.keys(component.variants).length : 0,
		};
	}

	return stats;
}
