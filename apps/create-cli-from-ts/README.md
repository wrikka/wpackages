# Create CLI from TS

A powerful CLI tool to bundle a TypeScript file and its local dependencies into a complete, distributable package.

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

## License

MIT
