import type { DocumentFormat } from "../types";

/**
 * Detect document format from content or filename
 */
export const detectFormat = (
	input: string,
	filename?: string,
): DocumentFormat => {
	// Detect from filename extension
	if (filename) {
		if (filename.endsWith(".md") || filename.endsWith(".markdown")) {
			return "markdown";
		}
		if (
			filename.endsWith(".ts")
			|| filename.endsWith(".tsx")
			|| filename.endsWith(".js")
			|| filename.endsWith(".jsx")
		) {
			return "typescript";
		}
		if (filename.endsWith(".toml")) {
			return "toml";
		}
		if (filename.endsWith(".json")) {
			return "json";
		}
	}

	// Detect from content
	const trimmed = input.trim();

	// JSON detection
	if (
		(trimmed.startsWith("{") && trimmed.endsWith("}"))
		|| (trimmed.startsWith("[") && trimmed.endsWith("]"))
	) {
		try {
			JSON.parse(trimmed);
			return "json";
		} catch {
			// Not valid JSON
		}
	}

	// TOML detection (has [section] or key = value)
	if (
		(trimmed.includes("[") && trimmed.includes("]"))
		|| /^\w+\s*=/.test(trimmed)
	) {
		return "toml";
	}

	// TypeScript detection (has typical TS/JS keywords)
	if (
		/\b(function|const|let|var|class|interface|type|import|export)\b/.test(
			trimmed,
		)
	) {
		return "typescript";
	}

	// Default to markdown
	return "markdown";
};
