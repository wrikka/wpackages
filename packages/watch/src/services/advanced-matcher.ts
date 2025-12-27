import { globToRegex } from "../utils/glob-to-regex";

/**
 * Advanced pattern matcher with support for negation patterns and complex rules
 */
export class AdvancedPatternMatcher {
	private patterns: string[];
	private negatedPatterns: RegExp[] = [];
	private regularPatterns: RegExp[] = [];

	constructor(patterns: string[]) {
		this.patterns = patterns;
		this.parsePatterns();
	}

	/**
	 * Parse patterns into negated and regular patterns
	 */
	private parsePatterns(): void {
		for (const pattern of this.patterns) {
			if (pattern.startsWith("!")) {
				// Negated pattern
				const regex = globToRegex(pattern.substring(1));
				this.negatedPatterns.push(regex);
			} else {
				// Regular pattern
				const regex = globToRegex(pattern);
				this.regularPatterns.push(regex);
			}
		}
	}

	/**
	 * Check if a path should be ignored based on patterns
	 * Returns true if the path should be ignored
	 */
	public shouldIgnore(path: string): boolean {
		const normalizedPath = path.replace(/\\/g, "/");

		// First check negated patterns - if any match, we should NOT ignore
		for (const regex of this.negatedPatterns) {
			if (regex.test(normalizedPath)) {
				return false;
			}
		}

		// Then check regular patterns - if any match, we should ignore
		for (const regex of this.regularPatterns) {
			if (regex.test(normalizedPath)) {
				return true;
			}
		}

		// No patterns matched, don't ignore by default
		return false;
	}

	/**
	 * Check if a path matches any pattern (ignoring negated patterns)
	 */
	public matches(path: string): boolean {
		const normalizedPath = path.replace(/\\/g, "/");

		for (const regex of this.regularPatterns) {
			if (regex.test(normalizedPath)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get all patterns
	 */
	public getPatterns(): string[] {
		return [...this.patterns];
	}
}
