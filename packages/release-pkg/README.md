# release

> Modern release automation tool - The complete solution: versioning, changelogs, preview releases, and more

[![npm version](https://img.shields.io/npm/v/release.svg)](https://www.npmjs.com/package/release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why release?

### Core Release Management

- ⚡ **Lightning Fast** - 3 dependencies vs 40+ in competitors
- 📦 **Tiny Bundle** - ~80KB vs 2-5MB in alternatives
- 🎯 **Zero Config** - Works out of the box, configure if needed
- 🔒 **Type-Safe** - Full TypeScript support with exported types
- 🚀 **Modern** - Built with latest ES features, async/await
- ✨ **Smart** - Built-in semver, no external dependencies

### Preview Releases (Better than pkg.pr.new)

- 🎯 **Multi-Registry** - npm, JSR, GitHub Packages, custom registries
- 🏢 **Monorepo Native** - Auto-detect changed packages
- 🎮 **Playground Integration** - StackBlitz, CodeSandbox, and more
- 📊 **Analytics** - Track preview package usage
- 🔄 **Rollback Support** - Unpublish preview packages
- 🛠️ **Self-Hostable** - Run your own registry

## Features

### Release Management

- 📦 **Version Bumping** - Semantic versioning (major, minor, patch, prerelease)
- 📝 **Changelog Generation** - Auto-generate from conventional commits
- 🏷️ **Git Tags** - Create and push tags automatically
- 📤 **NPM Publishing** - Publish to npm registry
- 🎯 **Interactive Mode** - User-friendly prompts or CLI flags
- 🔍 **Dry Run** - Preview changes before applying
- ✅ **Validation** - Pre-release checks and validation
- 🎨 **Custom Semver** - Built-in implementation, no dependencies

### Preview Releases

- 🎯 **PR Integration** - Auto-publish on pull requests
- 🏢 **Monorepo Support** - Auto-detect and publish changed packages
- 🌐 **Multi-Registry** - npm, JSR, GitHub Packages, custom
- 🎮 **Playgrounds** - Generate StackBlitz/CodeSandbox links
- 📊 **Analytics** - Track downloads and usage
- 🔄 **Rollback** - Unpublish previews easily
- ⏰ **TTL** - Auto-expire preview packages

## Quick Start

### Installation

```bash
bun add -D release
# or
npm install -D release
# or
pnpm add -D release
```

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
import { createReleaseApp } from "release";

const app = createReleaseApp();

const result = await app.release({
	type: "patch",
	verbose: true,
});

console.log(`Released ${result.version}`);
```

See [API Documentation](./docs/api.md) for detailed usage.

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

## Workflow

1. **Validate** - Check for uncommitted changes
2. **Version Bump** - Update package.json version
3. **Changelog** - Generate CHANGELOG.md from commits
4. **Git Commit** - Commit changes
5. **Git Tag** - Create version tag
6. **Git Push** - Push commits and tags
7. **Publish** - Publish to npm

## Features

### Conventional Commits

Automatically categorizes commits by type:

- ✨ Features (`feat:`)
- 🐛 Bug Fixes (`fix:`)
- 📝 Documentation (`docs:`)
- ♻️ Refactoring (`refactor:`)
- ⚡ Performance (`perf:`)
- ✅ Tests (`test:`)
- 🔧 Chores (`chore:`)

### Breaking Changes

Detects breaking changes:

- `feat!:` or `fix!:` syntax
- `BREAKING CHANGE:` in commit body

### Custom Semver

Built-in semver implementation:

- No external dependencies
- Full semantic versioning support
- Prerelease support

## Options

```bash
Options:
  --type <type>         Release type (major, minor, patch, prerelease)
  --preid <id>          Prerelease identifier (beta, alpha, rc)
  --dry-run             Simulate release without changes
  --no-git              Skip git operations
  --no-changelog        Skip changelog generation
  --no-publish          Skip npm publish
  --message <msg>       Custom commit message
  --tag <prefix>        Custom tag prefix (default: v)
  -v, --verbose         Verbose output
  -s, --silent          Silent mode
  -h, --help            Show help
```

## Examples

### Standard Release

```bash
# Patch release (1.0.0 → 1.0.1)
wrelease patch

# Minor release (1.0.0 → 1.1.0)
wrelease minor

# Major release (1.0.0 → 2.0.0)
wrelease major
```

### Prerelease

```bash
# First prerelease (1.0.0 → 1.0.1-beta.0)
wrelease prepatch --preid beta

# Increment prerelease (1.0.1-beta.0 → 1.0.1-beta.1)
wrelease prerelease
```

### CI/CD Integration

```bash
# Non-interactive release
wrelease patch --no-changelog --ci
```

## Comparison with Alternatives

### Release Management Tools

| Feature               | @wpackages/release-pkg | release-it       | semantic-release | changesets    |
| --------------------- | ---------------------- | ---------------- | ---------------- | ------------- |
| **Bundle Size**       | **~80KB**              | ~2MB             | ~5MB             | ~1MB          |
| **Dependencies**      | **4**                  | ~43              | ~67              | ~32           |
| **Programmatic API**  | ✅ (First-class TS)    | ✅               | ✅ (Via Plugins) | ✅            |
| **Zero Config**       | ✅                     | ❌               | ❌               | ❌            |
| **Interactive Mode**  | ✅                     | ✅               | ❌               | ✅            |
| **Monorepo Support**  | ✅ (Native)            | ⚠️ (Plugin)       | ⚠️ (Plugin)       | ✅ (Core)     |
| **PR Previews**       | ✅ (Built-in)          | ⚠️ (Pre-releases) | ⚠️ (Channels)     | ✅ (Snapshot) |
| **CI/CD Integration** | ✅ (Simple)            | ✅ (Flexible)    | ✅ (Opinionated) | ✅ (Flexible) |

### Preview Release Tools

| Feature                | @wpackages/release-pkg | pkg.pr.new             |
| ---------------------- | ---------------------- | ---------------------- |
| **Publish Target**     | ✅ (npm, JSR, etc.)    | ❌ (Own Registry Only) |
| **Monorepo Support**   | ✅ (Native)            | ✅                     |
| **Analytics**          | ✅                     | ❌                     |
| **Self-Hostable**      | ✅                     | ❌                     |
| **Rollback/Unpublish** | ✅                     | ❌                     |
| **Programmatic API**   | ✅ (Type-Safe)         | ❌                     |

**Score: release wins 27-3-11** 🏆

See detailed comparisons:

- [vs release-it, semantic-release, changesets](./docs/comparison.md)
- [vs pkg.pr.new](./docs/pkgprnew-comparison.md)

## Examples

### Release Management

- [Basic Usage](./examples/basic-usage.ts) - Simple patch release
- [Dry Run](./examples/dry-run.ts) - Preview without changes
- [Prerelease](./examples/prerelease.ts) - Beta/alpha releases
- [Custom Version](./examples/custom-version.ts) - Specific version
- [No Publish](./examples/no-publish.ts) - Release without publishing
- [API Usage](./examples/api-usage.ts) - Advanced programmatic usage

### Preview Releases

- [Basic Preview](./examples/preview-basic.ts) - Simple preview publish
- [Monorepo Preview](./examples/preview-monorepo.ts) - Auto-detect changed packages
- [Multi-Registry](./examples/preview-multi-registry.ts) - Publish to multiple registries
- [Analytics](./examples/preview-analytics.ts) - Track preview usage

## Documentation

### Guides

- [Preview Releases Guide](./docs/preview-releases.md) - Complete preview releases documentation
- [API Documentation](./docs/api.md) - Full API reference
- [Migration from pkg.pr.new](./docs/migration-pkgprnew.md) - Step-by-step migration guide

### Comparisons

- [vs release-it, semantic-release, changesets](./docs/comparison.md)
- [vs pkg.pr.new (In-depth)](./docs/pkgprnew-comparison.md) - 27-3-11 score breakdown

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Wrikka](https://github.com/wrikka)
