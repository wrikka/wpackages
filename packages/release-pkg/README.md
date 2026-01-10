# @wpackages/release-pkg

> Modern release automation tool - The complete solution: versioning, changelogs, preview releases, and more

[![npm version](https://img.shields.io/npm/v/@wpackages/release-pkg.svg)](https://www.npmjs.com/package/@wpackages/release-pkg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Introduction

@wpackages/release-pkg is a modern, lightweight, and extensible release automation tool designed for JavaScript/TypeScript projects. It provides a complete solution for managing package releases with zero configuration required out of the box. Built with a plugin-based architecture and full TypeScript support, it offers unparalleled flexibility while maintaining simplicity and performance. With only 4 dependencies and a bundle size of ~80KB, it's significantly faster and lighter than alternatives like release-it (~2MB, 43 deps) or semantic-release (~5MB, 67 deps).

The tool supports both traditional release workflows and modern preview releases, making it perfect for libraries, applications, and monorepos. Its powerful plugin system with 16 lifecycle hooks allows you to customize every aspect of the release process, from validation to publishing.

## Features

### Core Release Management

- ⚡ **Lightning Fast** - 3 dependencies vs 40+ in competitors
- 📦 **Tiny Bundle** - ~80KB vs 2-5MB in alternatives
- 🎯 **Zero Config** - Works out of the box, configure if needed
- 🔒 **Type-Safe** - Full TypeScript support with exported types
- 🚀 **Modern** - Built with latest ES features, async/await
- ✨ **Smart** - Built-in semver, no external dependencies
- 🎮 **Interactive Mode** - User-friendly prompts or CLI flags
- 🔍 **Dry Run** - Preview changes before applying
- ✅ **Validation** - Pre-release checks and validation
- 🎨 **Custom Semver** - Built-in implementation, no dependencies

### Preview Releases (Better than pkg.pr.new)

- 🎯 **Multi-Registry** - npm, JSR, GitHub Packages, custom registries
- 🏢 **Monorepo Native** - Auto-detect changed packages
- 🎮 **Playground Integration** - StackBlitz, CodeSandbox, and more
- 📊 **Analytics** - Track preview package usage
- 🔄 **Rollback Support** - Unpublish preview packages
- 🛠️ **Self-Hostable** - Run your own registry
- ⏰ **TTL Support** - Auto-expire preview packages
- 💬 **PR Comments** - Auto-generate preview comments

### Plugin System

- 🔌 **16 Lifecycle Hooks** - Extensive customization options
- 🎯 **Context Sharing** - Shared state between hooks
- 📦 **Service Injection** - Access to core services
- 🎨 **Custom Renderers** - Customizable changelog generation
- 🔧 **Hook Composition** - Multiple plugins per hook

### Version Management

- 📦 **Version Bumping** - Semantic versioning (major, minor, patch, prerelease)
- 📝 **Changelog Generation** - Auto-generate from conventional commits
- 🏷️ **Git Tags** - Create and push tags automatically
- 📤 **NPM Publishing** - Publish to npm registry
- 🔄 **Pre-release Support** - Beta, alpha, RC versions
- 🎯 **Custom Versions** - Set specific versions manually

### Conventional Commits

- ✨ **Features** (`feat:`)
- 🐛 **Bug Fixes** (`fix:`)
- 📝 **Documentation** (`docs:`)
- ♻️ **Refactoring** (`refactor:`)
- ⚡ **Performance** (`perf:`)
- ✅ **Tests** (`test:`)
- 🔧 **Chores** (`chore:`)
- 🚨 **Breaking Changes** - `feat!:` or `BREAKING CHANGE:` detection

## Goal

- 🎯 **Simplify Release Process** - Make releasing packages painless and automated
- ⚡ **Maximize Performance** - Minimal dependencies and bundle size
- 🔒 **Ensure Type Safety** - Full TypeScript support for better developer experience
- 🔌 **Provide Extensibility** - Plugin system for unlimited customization
- 🏢 **Support Monorepos** - Native support for complex project structures
- 🚀 **Enable Preview Releases** - Fast feedback loops with preview packages
- 📊 **Improve Visibility** - Analytics and tracking for releases
- 🛠️ **Maintain Simplicity** - Zero-config approach with optional configuration
- 🎨 **Modern Design** - Built with modern patterns and best practices
- 🌐 **Multi-Platform** - Support for multiple registries and platforms

## Design Principles

- 🎯 **Zero-Config First** - Works out of the box, configure only when needed
- ⚡ **Performance Matters** - Minimal dependencies, fast execution
- 🔒 **Type Safety** - Full TypeScript with exported types
- 🔌 **Plugin-Based** - Extensible architecture with lifecycle hooks
- 🎨 **Composition Over Configuration** - Composable services and utilities
- 📦 **Small Bundle** - Keep the tool lightweight and fast
- 🚀 **Modern Standards** - Use latest ES features and patterns
- 🔄 **Functional Patterns** - Immutable data, pure functions where possible
- 🎮 **Developer Experience** - Interactive mode, clear errors, helpful output
- 🌐 **Platform Agnostic** - Works with any registry and platform
- 🏢 **Monorepo Native** - Built-in support for monorepo workflows
- 📊 **Observable** - Analytics and tracking capabilities
- 🛠️ **Extensible** - Easy to add custom functionality
- 🎯 **Focused** - Do one thing well: release automation
- 🔧 **Pragmatic** - Practical solutions to real-world problems

## Quick Start

### Installation

<details>
<summary><b>Install with Bun</b></summary>

```bash
bun add -D @wpackages/release-pkg
```

</details>

<details>
<summary><b>Install with npm</b></summary>

```bash
npm install -D @wpackages/release-pkg
```

</details>

<details>
<summary><b>Install with pnpm</b></summary>

```bash
pnpm add -D @wpackages/release-pkg
```

</details>

<details>
<summary><b>Install with Yarn</b></summary>

```bash
yarn add -D @wpackages/release-pkg
```

</details>

## Usage

### Interactive Mode

Run without arguments for interactive prompts:

```bash
wrelease
```

### CLI Mode

```bash
# Bump patch version (1.0.0 → 1.0.1)
wrelease patch

# Bump minor version (1.0.0 → 1.1.0)
wrelease minor

# Bump major version (1.0.0 → 2.0.0)
wrelease major

# Create prerelease (1.0.0 → 1.0.1-beta.0)
wrelease prepatch --preid beta

# Increment prerelease (1.0.0-beta.0 → 1.0.0-beta.1)
wrelease prerelease

# Dry run - preview without changes
wrelease patch --dry-run

# Skip specific steps
wrelease patch --no-git        # Skip git operations
wrelease patch --no-changelog  # Skip changelog generation
wrelease patch --no-publish    # Skip npm publish

# Custom commit message
wrelease patch --message "chore: release v{version}"
```

### Programmatic API

```typescript
import { createReleaseApp } from "@wpackages/release-pkg";

const app = createReleaseApp();

const result = await app.release({
	type: "patch",
	verbose: true,
});

console.log(`Released ${result.version}`);
```

### Using the release function directly

```typescript
import { release } from "@wpackages/release-pkg";

const result = await release({
	type: "minor",
	dryRun: true,
});

console.log(`Would release ${result.version}`);
```

## Extensibility

`release-pkg` is designed to be extensible through a powerful plugin system and customizable changelog renderers.

### Plugin System

You can tap into the release lifecycle using plugins. A plugin is a simple object with a `name` and a `hooks` property. Hooks allow you to execute code at various points in the release process.

**Available Hooks:**

- `start`
- `before:validate` / `after:validate`
- `before:bumpVersion` / `after:bumpVersion`
- `before:changelog` / `after:changelog`
- `before:gitCommit` / `after:gitCommit`
- `before:publish` / `after:publish`
- `end`

**Example: A Logger Plugin**

Here's a simple plugin that logs each lifecycle event.

```typescript
import type { Plugin } from "@wpackages/release-pkg";

export const LifecycleLoggerPlugin: Plugin = {
	name: "lifecycle-logger-plugin",
	hooks: {
		start: (ctx) => console.log(`Starting release for ${ctx.options.type}`),
		"after:bumpVersion": (ctx) => {
			console.log(`Version bumped to ${ctx.result.version}`);
		},
		end: () => console.log("Release finished!"),
	},
};
```

**Usage:**

Pass your plugins via the `plugins` array in the release options.

```typescript
import { release } from "@wpackages/release-pkg";
import { LifecycleLoggerPlugin } from "./plugins/logger.plugin";

await release({
	type: "patch",
	plugins: [LifecycleLoggerPlugin],
});
```

### Customizable Changelog

You can provide your own function to render the changelog content. The function receives a context object with all the necessary data.

**Example: JSON Changelog Renderer**

Instead of Markdown, you can output the changelog as JSON.

```typescript
import type { ChangelogRenderer } from "@wpackages/release-pkg";

export const jsonChangelogRenderer: ChangelogRenderer = (context) => {
	// context contains: version, date, commits, breaking, features, fixes, others
	return JSON.stringify(context, null, 2);
};
```

**Usage:**

Pass the renderer function via the `changelog` option.

```typescript
import { release } from "@wpackages/release-pkg";
import { jsonChangelogRenderer } from "./renderers/json.renderer";

await release({
	type: "patch",
	changelog: jsonChangelogRenderer,
});
```

### Preview Releases

```bash
# Publish preview for PR
wrelease preview

# With specific PR number
wrelease preview --pr 123

# Custom registry
wrelease preview --registry https://my-registry.com

# Monorepo - publish only changed packages
wrelease preview --changed-only
```

See [Preview Releases Guide](./docs/preview-releases.md) for more details.

## Examples

### Basic Release

```typescript
import { release } from "@wpackages/release-pkg";

// Simple patch release
const result = await release({ type: "patch" });

console.log(`Released ${result.version}`);
console.log(`Duration: ${result.duration}ms`);
console.log(`Published: ${result.published}`);
```

### Dry Run

```typescript
import { release } from "@wpackages/release-pkg";

// Preview changes without applying them
const result = await release({
	type: "minor",
	dryRun: true,
});

console.log(`Would release ${result.previousVersion} → ${result.version}`);
```

### Prerelease

```typescript
import { release } from "@wpackages/release-pkg";

// Create a beta release
const result = await release({
	type: "prepatch",
	preid: "beta",
});

console.log(`Released ${result.version}`);
```

### Custom Version

```typescript
import { release } from "@wpackages/release-pkg";

// Set a specific version
const result = await release({
	version: "2.0.0",
});

console.log(`Released ${result.version}`);
```

### No Publish

```typescript
import { release } from "@wpackages/release-pkg";

// Release without publishing to npm
const result = await release({
	type: "patch",
	noPublish: true,
});

console.log(`Released ${result.version} (not published)`);
```

### Using Plugins

```typescript
import { release, type Plugin } from "@wpackages/release-pkg";

const myPlugin: Plugin = {
	name: "my-plugin",
	hooks: {
		"before:publish": async (ctx) => {
			console.log("About to publish!", ctx.result.version);
		},
	},
};

await release({
	type: "patch",
	plugins: [myPlugin],
});
```

### Custom Changelog Renderer

```typescript
import { release, type ChangelogRenderer } from "@wpackages/release-pkg";

const jsonChangelogRenderer: ChangelogRenderer = (context) => {
	return JSON.stringify({
		version: context.version,
		date: context.date,
		features: context.features.map((f) => f.subject),
		fixes: context.fixes.map((f) => f.subject),
	}, null, 2);
};

await release({
	type: "patch",
	changelog: jsonChangelogRenderer,
});
```

### Preview Release

```typescript
import { PreviewService } from "@wpackages/release-pkg";

const previewService = new PreviewService();

const result = await previewService.publishPreview({
	prNumber: 123,
	ttl: 7, // 7 days
});

console.log(`Preview URL: ${result.url}`);
console.log(`Install: ${result.installCommand}`);
```

### Application Composition

```typescript
import { createReleaseApp } from "@wpackages/release-pkg";

const app = createReleaseApp();

// Use the app instance
const result1 = await app.release({ type: "patch" });
const result2 = await app.release({ type: "minor" });
```

### Using Individual Services

```typescript
import { VersionService, GitService, ChangelogService } from "@wpackages/release-pkg";

const versionService = new VersionService();
const gitService = new GitService();
const changelogService = new ChangelogService();

// Get current version
const version = await versionService.getCurrentVersion();
console.log(`Current version: ${version}`);

// Get commits
const commits = await gitService.getCommits();
console.log(`Found ${commits.length} commits`);

// Generate changelog
const changelog = await changelogService.generate("1.0.0", commits);
console.log(changelog);
```

### CI/CD Integration

```bash
# Non-interactive release for CI/CD
wrelease patch --no-changelog --ci
```

```yaml
# GitHub Actions example
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bunx wrelease patch --ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Workflow

1. **Validate** - Check for uncommitted changes
2. **Version Bump** - Update package.json version
3. **Changelog** - Generate CHANGELOG.md from commits
4. **Git Commit** - Commit changes
5. **Git Tag** - Create version tag
6. **Git Push** - Push commits and tags
7. **Publish** - Publish to npm

## License

MIT © [Wrikka](https://github.com/wrikka)
