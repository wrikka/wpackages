# API Reference

This document provides a detailed reference for the programmatic API of `@wpackages/release-pkg`.

## Core API

These are the main entry points for using the package.

### `createReleaseApp()`

Creates and configures a new release application instance. This is the primary factory function for accessing the release workflow.

**Returns:** `ReleaseApp` - An object containing the `release` method.

**Example:**
```typescript
import { createReleaseApp } from "@wpackages/release-pkg";

const app = createReleaseApp();
```

### `release(options: ReleaseOptions)`

The core function that runs the entire release workflow based on the provided options.

**Parameters:**
- `options` (`ReleaseOptions`): An object to configure the release process.

**Returns:** `Promise<ReleaseResult>` - A promise that resolves with the results of the release, including the new version.

**Example:**
```typescript
import { release } from "@wpackages/release-pkg";

async function main() {
  const result = await release({
    type: "patch",
    dryRun: true,
  });
  console.log(`Successfully bumped version to ${result.version}`);
}

main();
```

---

## Types

Key TypeScript types exported for building plugins and custom integrations.

- **`ReleaseOptions`**: The main configuration object for the `release` function. Defines the release type, dry-run mode, plugins, etc.
- **`ReleaseResult`**: The object returned upon a successful release, containing the final version and other metadata.
- **`ReleaseType`**: A string literal type for the release increment: `'major' | 'minor' | 'patch' | 'prerelease' | 'prepatch' | 'preminor' | 'premajor'`.
- **`Commit`**: Represents a parsed git commit, including its hash, message, and type (`feat`, `fix`, etc.).
- **`ChangelogEntry`**: Represents a single entry in the generated changelog.

---

## Services

Core services that handle different parts of the release process. These can be used for more advanced, custom workflows.

- **`VersionService`**: Manages version detection, bumping, and parsing from `package.json`.
- **`GitService`**: Handles all git operations: checking status, committing, tagging, and pushing.
- **`ChangelogService`**: Responsible for parsing commits and generating the `CHANGELOG.md` file.
- **`PublishService`**: Manages publishing the package to a registry (e.g., npm).

### Preview Release Services

Services specific to the preview release workflow.

- **`PreviewService`**: Orchestrates the entire preview release process.
- **`MonorepoService`**: Detects packages in a monorepo and identifies which ones have changed.
- **`GitHubService`**: Interacts with the GitHub API to post comments on pull requests.
- **`RegistryService`**: Handles publishing to and unpublishing from various package registries (npm, JSR, GitHub Packages).
- **`AnalyticsService`**: Provides functionality for tracking preview package usage and downloads.

---

## Utils

Helper functions for working with semantic versioning.

- **`parseVersion(version: string)`**: Parses a version string into a `Version` object (`{ major, minor, patch, preRelease }`).
- **`formatVersion(version: Version)`**: Formats a `Version` object back into a string.
- **`incrementVersion(version: Version, type: ReleaseType)`**: Increments a `Version` object by the specified release type.
- **`compareVersions(v1: string, v2: string)`**: Compares two version strings, returning `1`, `0`, or `-1`.
- **`isValidVersion(version: string)`**: Checks if a string is a valid semantic version.

