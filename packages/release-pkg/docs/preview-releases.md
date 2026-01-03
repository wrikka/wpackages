# Preview Releases Guide

Preview Releases are a powerful feature of `@wpackages/release-pkg` that allows you to publish temporary, sandboxed versions of your package directly from a pull request or commit. This enables seamless testing and validation of changes without impacting your official release cycle.

## Core Concepts

Instead of publishing to a public registry like npm, a preview release is published to a temporary, isolated registry. A unique, installable URL is generated for your PR, which can be shared with team members or used in CI for integration testing.

This workflow dramatically speeds up the feedback loop for new features and bug fixes.

## Key Features

- **PR Integration**: Automatically publishes a preview when a pull request is created and updates it on new commits.
- **Monorepo Support**: Intelligently detects which packages in a monorepo have changed and only publishes previews for those packages.
- **Multi-Registry Support**: Publish previews to **npm**, **JSR**, **GitHub Packages**, or a **custom self-hosted registry**.
- **Playground Integration**: Automatically generates links to test the preview release in online IDEs like **StackBlitz** and **CodeSandbox**.
- **Usage Analytics**: Track download counts and other usage metrics for your preview packages to see how they are being tested.
- **Rollback & Expiration (TTL)**: Easily unpublish (rollback) a preview version or configure it to expire automatically after a certain time-to-live (TTL).

## Usage

The primary way to use Preview Releases is via the CLI in a CI/CD environment.

### Basic Command

Run the following command in your CI workflow (e.g., GitHub Actions) on a pull request event:

```bash
wrelease preview
```

This will automatically detect the environment, build the package, publish it, and post a comment on the pull request with installation instructions and playground links.

### Monorepo Usage

In a monorepo, the command remains the same. The tool will automatically detect changed packages and publish them.

```bash
# Publish previews only for packages that have changed since the last release
wrelease preview --changed-only
```

### Options

- `--pr <number>`: Manually specify a pull request number.
- `--registry <url>`: Publish to a custom registry URL.
- `--no-comment`: Disable posting a comment on the pull request.
- `--ttl <days>`: Set an expiration date in days for the preview package.

**Example GitHub Action Workflow:**

```yaml
name: "Create Preview Release"

on:
  pull_request:

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Publish Preview
        run: bunx wrelease preview
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }} # If publishing to npm registry
```
