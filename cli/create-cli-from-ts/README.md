# Create CLI from TS

A powerful CLI tool to bundle a TypeScript file and its local dependencies into a complete, distributable package.

## Introduction

`create-cli-from-ts` (BuildPC) is a bundler/scaffolder for turning a TypeScript entry file into a ready-to-publish CLI package.
It crawls local imports, copies the source files into a new package folder, generates common config files, and produces a runnable CLI entry.

## Design Principles

- **Pragmatic defaults**: Generates a minimal-but-usable package setup (tsdown, lint, test).
- **Local-first bundling**: Focuses on bundling local source imports (relative paths) into a single package folder.
- **Reproducible output**: Uses templates under `src/config/` and placeholder replacement so generated packages are consistent.
- **CLI-friendly build output**: Ensures the build output has a shebang via `postbuild` so it can be executed as a CLI.

## Features

- 🚀 **Zero-Configuration Bundling**: Just point to your entry file, and the tool handles the rest.
- 🔍 **Dependency Detection**: Automatically finds and includes all local imports.
- 📦 **Package Scaffolding**: Generates a complete package structure with `package.json`, `tsconfig.json`, and other essential configs.
- ✨ **AI-Powered Enhancement**: Optionally uses OpenAI to improve your `README.md` and `package.json` metadata.
- ⚙️ **Ready-to-Use Scripts**: Includes pre-configured scripts for building, linting, formatting, and testing.

## Installation

```bash
# Install globally to use anywhere
bun install -g create-cli-from-ts
```

## Usage

To bundle a TypeScript file into a new package, simply run:

```bash
create-cli-from-ts <path-to-your-entry-file.ts>
```

The tool will guide you through the process, asking for a package name and offering AI assistance.

You can also use the non-interactive command form:

```bash
create-cli-from-ts build --entry <path-to-entry.ts> --name <package-name>
```

### Options

- **`--entry` / `-e`**
  - Entry file path
- **`--name` / `-n`**
  - Generated package folder name
- **`--ai`**
  - Enable AI enhancement (requires `--openaiKey` or interactive key input)
- **`--openaiKey`**
  - OpenAI API key (implies AI mode)

## Examples

- **Run the built-in example**

```bash
bun run examples
```

This generates a folder like:

```text
example-generated-cli/
  src/
  package.json
  tsconfig.json
  biome.jsonc
  lefthook.yml
  .gitignore
  README.md
```

## License

MIT
