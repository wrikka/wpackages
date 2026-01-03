import type { ParsedEnv } from "../types/env";

/**
 * Expand variables in value (${VAR} or $VAR)
 */
export const expandValue = (value: string, env: ParsedEnv): string => {
	// Expand ${VAR} syntax
	let expanded = value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/gi, (match, key) => {
		return env[key] || match;
	});

	// Expand $VAR syntax
	expanded = expanded.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (match, key) => {
		return env[key] || match;
	});

	return expanded;
};

/**
 * Expand all variables in env
 */
export const expandEnv = (env: ParsedEnv): ParsedEnv => {
	const expanded: ParsedEnv = {};
	const maxIterations = 10; // Prevent infinite loops
	let currentEnv = { ...env };

	for (let i = 0; i < maxIterations; i++) {
		let changed = false;

		for (const [key, value] of Object.entries(currentEnv)) {
			const expandedValue = expandValue(value, currentEnv);

			if (expandedValue !== value) {
				changed = true;
			}

			expanded[key] = expandedValue;
		}

		if (!changed) break;
		currentEnv = { ...expanded };
	}

	return expanded;
};

/**
 * Check if value contains variables
 */
export const hasVariables = (value: string): boolean => {
	return /\$\{[A-Z_][A-Z0-9_]*\}|\$[A-Z_][A-Z0-9_]*/i.test(value);
};

/**
 * Extract variable names from value
 */
export const extractVariables = (value: string): string[] => {
	const variables: string[] = [];

	// Extract ${VAR}
	const bracketMatches = value.matchAll(/\$\{([A-Z_][A-Z0-9_]*)\}/gi);
	for (const match of bracketMatches) {
		if (match[1]) {
			variables.push(match[1]);
		}
	}

	// Extract $VAR
	const simpleMatches = value.matchAll(/\$([A-Z_][A-Z0-9_]*)/gi);
	for (const match of simpleMatches) {
		// Skip if already matched as ${VAR}
		if (match[1] && !variables.includes(match[1])) {
			variables.push(match[1]);
		}
	}

	return [...new Set(variables)];
};
