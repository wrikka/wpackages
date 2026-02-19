import type { Script, ScriptResult } from "../types";

/**
 * Validate script configuration
 * @param script - Script configuration to validate
 * @returns Boolean indicating if script is valid
 */
export const isValidScript = (script: unknown): script is Script => {
	if (typeof script !== "object" || script === null) return false;

	const s = script as Script;
	return (
		typeof s.name === "string"
		&& typeof s.command === "string"
		&& s.name.length > 0
		&& s.command.length > 0
	);
};

/**
 * Format script result for display
 * @param result - Script execution result
 * @returns Formatted string
 */
export const formatScriptResult = (result: ScriptResult): string => {
	const status = result.success ? "✓" : "✗";
	const duration = `${result.duration}ms`;
	const output = result.output ? `\n${result.output}` : "";
	const error = result.error ? `\nError: ${result.error}` : "";

	return `${status} ${result.name} (${duration})${output}${error}`;
};

/**
 * Sort scripts by dependencies
 * @param scripts - Scripts to sort
 * @returns Sorted scripts array
 */
export const sortScriptsByDependencies = (scripts: Script[]): Script[] => {
	const sorted: Script[] = [];
	const visited = new Set<string>();
	const visiting = new Set<string>();

	const visit = (script: Script): void => {
		if (visited.has(script.name)) return;
		if (visiting.has(script.name)) {
			throw new Error(`Circular dependency detected: ${script.name}`);
		}

		visiting.add(script.name);

		if (script.dependencies) {
			for (const depName of script.dependencies) {
				const dep = scripts.find((s) => s.name === depName);
				if (dep) {
					visit(dep);
				}
			}
		}

		visiting.delete(script.name);
		visited.add(script.name);
		sorted.push(script);
	};

	for (const script of scripts) {
		visit(script);
	}

	return sorted;
};

/**
 * Filter scripts by name pattern
 * @param scripts - Scripts to filter
 * @param pattern - Name pattern to match
 * @returns Filtered scripts array
 */
export const filterScriptsByName = (
	scripts: Script[],
	pattern: string,
): Script[] => {
	if (!pattern) return scripts;

	const regex = new RegExp(pattern, "i");
	return scripts.filter((script) => regex.test(script.name));
};
