/**
 * Default constants for BuildPC
 */

export const FILE_EXTENSIONS = [".ts", ".js", ".tsx", ".jsx"] as const;

export const BUILTIN_MODULES = [
	"fs",
	"path",
	"util",
	"crypto",
	"events",
	"stream",
	"buffer",
	"os",
] as const;

export const DEFAULT_KEYWORDS = "cli,typescript,bundler" as const;

export const DEFAULT_DESCRIPTION_TEMPLATE = (packageName: string) =>
	`Bundled package for ${packageName}`;

export const DEFAULT_README_TEMPLATE = (packageName: string, files: string[]) => `# ${packageName}

Bundled package created by BuildPC

## Files included:
${files.map(f => `- ${f}`).join("\n")}

## Usage

\`\`\`bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Lint
bun run lint

# Format
bun run format
\`\`\`
`;

export const DEFAULT_VERSION = "1.0.0" as const;
export const DEFAULT_AUTHOR = "Unknown" as const;
export const DEFAULT_LICENSE = "MIT" as const;

export const CONFIG_FILES = ["tsconfig.json", "biome.jsonc", "lefthook.yml"] as const;
export const GITIGNORE_FILE = ".gitignore" as const;

export const PACKAGE_JSON_TEMPLATE_PLACEHOLDERS = {
	PACKAGE_NAME: "{{PACKAGE_NAME}}",
	DESCRIPTION: "{{DESCRIPTION}}",
	BIN_NAME: "{{BIN_NAME}}",
	KEYWORDS: "{{KEYWORDS}}",
	AUTHOR: "{{AUTHOR}}",
	DEPENDENCIES: "{{DEPENDENCIES}}",
} as const;

export const AI_MODEL = "gpt-3.5-turbo" as const;
export const AI_README_MAX_TOKENS = 1500 as const;
export const AI_PACKAGE_MAX_TOKENS = 800 as const;

export const SPINNER_MESSAGES = {
	ANALYZING: "🔍 Analyzing file dependencies...",
	ANALYSIS_COMPLETE: "✅ Analysis complete",
	INSTALLING: "Installing dependencies...",
	INSTALLED: "📦 Dependencies installed successfully",
	INSTALL_FAILED: "⚠️ Failed to install dependencies automatically",
	COMMITTING: "Committing to git...",
	COMMITTED: "📝 Changes committed to git",
	PUBLISHING: "Publishing to npm...",
	PUBLISHED: "🚀 Package published to npm",
} as const;

export const SUCCESS_MESSAGES = {
	PACKAGE_CREATED: "📦 Package created successfully!",
	LOCATION: "📁 Location:",
	DEPENDENCIES: "📝 Dependencies: Auto-detected and resolved",
	BUILD_TOOL: "⚡ Build tool: tsdown configured",
	CODE_QUALITY: "🎨 Code quality: Biome configured",
	GIT_HOOKS: "🪝 Git hooks: Lefthook configured",
	COMPLETED: "🎉 BuildPC completed successfully!",
} as const;

export const ERROR_MESSAGES = {
	PACKAGE_NAME_REQUIRED: "❌ Package name is required",
	NO_API_KEY: "⚠️ No API key provided, continuing without AI features",
	BUNDLING_ERROR: "❌ Error during bundling:",
	FILE_NOT_FOUND: (file: string) => `File not found: ${file}`,
	MAIN_PACKAGE_JSON_ERROR: "⚠️ Could not read main package.json",
	AI_ENHANCEMENT_FAILED: "⚠️ AI enhancement failed, using default content",
	INSTALL_HINT: "💡 Run: cd packages && bun install",
} as const;

export const HELP_TEXT = `
🛠️  BuildPC - Bundle imported files into packages

Usage: buildpc <file>

Example:
  buildpc src/main.ts
`;
