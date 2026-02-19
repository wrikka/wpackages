import { writeFileSync } from "fs";
import { resolve } from "path";

/**
 * Documentation generation macro for auto-generating docs from code.
 *
 * @param options - Documentation generation options
 * @returns Generated documentation
 * @throws Error if documentation generation fails
 *
 * @example
 * // const docs = generateDocs({
 * //   output: "./docs",
 * //   format: "markdown"
 * // })
 */
export const generateDocs = Bun.macro((
	options: DocsOptions = {},
) => {
	try {
		const output = options.output || "./docs";

		const docs = `# API Documentation

Generated at: ${new Date().toISOString()}

## Macros

This package provides the following macros:

- \`embed\` - Embed file contents at build time
- \`embedGlob\` - Embed multiple files matching glob patterns
- \`embedBase64\` - Embed files as base64 data URIs
- \`env\` - Type-safe environment variable access
- \`envTyped\` - Type-safe environment variable with explicit type
- \`envRequired\` - Required environment variable
- \`log\` - Compile-time logging with source location
- \`assert\` - Compile-time assertions

## Usage

See README.md for detailed usage examples.
`;

		if (options.writeToFile !== false) {
			const outputPath = resolve(import.meta.dir, "..", output, "API.md");
			writeFileSync(outputPath, docs, "utf-8");
		}

		return JSON.stringify(docs);
	} catch (error) {
		throw new Error(
			"Failed to generate documentation: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Documentation generation options.
 */
interface DocsOptions {
	output?: string;
	format?: "markdown" | "html" | "json";
	writeToFile?: boolean;
}

/**
 * Generate README documentation.
 *
 * @param options - README generation options
 * @returns README content
 *
 * @example
 * // const readme = generateReadme()
 */
export const generateReadme = Bun.macro((
	options: ReadmeOptions = {},
) => {
	const readme = `# @wpackages/macros-bun

A collection of useful Bun macros for build-time code generation.

## Features

- \`embed\` - Embed file contents at build time
- \`embedGlob\` - Embed multiple files matching glob patterns
- \`embedBase64\` - Embed files as base64 data URIs
- \`env\` - Type-safe environment variable access
- \`envTyped\` - Type-safe environment variable with explicit type
- \`envRequired\` - Required environment variable
- \`log\` - Compile-time logging with source location
- \`assert\` - Compile-time assertions

## Installation

\`\`\`bash
bun add @wpackages/macros-bun
\`\`\`

## Usage

### embed

\`\`\`typescript
import { embed } from "@wpackages/macros-bun";

const content = embed("./data.json");
console.log(content);
\`\`\`

### env

\`\`\`typescript
import { env } from "@wpackages/macros-bun";

const apiKey = env("API_KEY");
const port = env<number>("PORT", "3000");
\`\`\`

## License

MIT
`;

	if (options.writeToFile !== false) {
		const outputPath = resolve(import.meta.dir, "..", "README.md");
		writeFileSync(outputPath, readme, "utf-8");
	}

	return JSON.stringify(readme);
});

/**
 * README generation options.
 */
interface ReadmeOptions {
	writeToFile?: boolean;
}
