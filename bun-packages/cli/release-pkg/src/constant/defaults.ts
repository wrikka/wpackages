export const DEFAULT_TAG_PREFIX = "v";
export const DEFAULT_COMMIT_MESSAGE = "chore: release v{version}";
export const DEFAULT_CHANGELOG_FILE = "CHANGELOG.md";
export const DEFAULT_PACKAGE_FILE = "package.json";

export const COMMIT_TYPES = {
	build: { emoji: "📦", title: "Build System" },
	chore: { emoji: "🔧", title: "Chores" },
	ci: { emoji: "👷", title: "Continuous Integration" },
	docs: { emoji: "📝", title: "Documentation" },
	feat: { emoji: "✨", title: "Features" },
	fix: { emoji: "🐛", title: "Bug Fixes" },
	perf: { emoji: "⚡", title: "Performance Improvements" },
	refactor: { emoji: "♻️", title: "Code Refactoring" },
	revert: { emoji: "⏪", title: "Reverts" },
	style: { emoji: "💄", title: "Styles" },
	test: { emoji: "✅", title: "Tests" },
} as const;

export const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s(.+)$/;

export const RELEASE_STEPS = [
	"Validate",
	"Version Bump",
	"Changelog",
	"Git Commit",
	"Git Tag",
	"Git Push",
	"Publish",
] as const;
