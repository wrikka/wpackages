# @wpackages/generate-readme

## Introduction

`@wpackages/generate-readme` is an internal command-line tool designed to automate the creation and updating of `README.md` files across the `wpackages` monorepo. It analyzes a workspace's `package.json`, source code, and other conventions to generate a standardized, high-quality README that is consistent with the project's documentation standards.

## Features

- 🤖 **Automated Generation**: Creates a complete `README.md` from scratch based on project metadata and file structure.
- 🔍 **Workspace Analysis**: Intelligently inspects `package.json` to extract the package name, description, scripts, and dependencies.
- 템플릿 **Template-Driven**: Uses a standardized template to ensure all generated READMEs have a consistent structure, including sections like Introduction, Features, and Usage.
- 🔄 **Content Updating**: Can be used to refresh existing READMEs with the latest information.

## Goal

- 🎯 **Consistency**: To ensure that every package, app, and service in the monorepo has a clear, consistent, and useful `README.md`.
- ⏱️ **Time-Saving**: To automate the tedious process of writing and maintaining documentation, allowing developers to focus on writing code.
- ✅ **Quality Assurance**: To enforce a minimum standard of documentation for all workspaces, improving the overall quality of the project.

## Design Principles

- **Convention over Configuration**: The tool relies on the established conventions of the `wpackages` monorepo to gather information, requiring minimal manual configuration.
- **Idempotent**: Running the generator multiple times on the same package should produce a consistent result without unwanted side effects.
- **Extensible**: Designed to be easily updated as the project's documentation standards evolve.

## Installation

This is an internal development tool. Ensure all root dependencies are installed:

```bash
# From the monorepo root
bun install
```

## Usage

To generate a README for a specific workspace, run the tool and provide the path to the target workspace directory.

_Note: The following is an example of the intended command-line interface._

```bash
# Run the generator from the monorepo root
turbo dev --filter=@wpackages/generate-readme -- --workspace <path-to-workspace>

# Example for the 'palse' library
turbo dev --filter=@wpackages/generate-readme -- --workspace lib/palse
```

The tool will then analyze the specified workspace and either create a new `README.md` or update the existing one.

## License

This is an internal tool and is not intended for distribution. It is licensed under the MIT License.
