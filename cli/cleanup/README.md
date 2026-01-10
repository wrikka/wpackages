# @wpackages/cleanup

## Introduction

`@wpackages/cleanup` is a simple and interactive command-line tool for cleaning up common project artifacts. It provides an interactive prompt to select and safely delete temporary files and directories like `node_modules`, `dist` folders, lockfiles, and more.

## Features

- ✨ **Interactive Interface**: A user-friendly wizard powered by `@clack/prompts` guides you through the cleanup process.
- 🎯 **Targeted Cleanup**: Allows you to select exactly which types of artifacts you want to remove.
- 🚀 **Fast and Safe**: Uses `glob` for fast file discovery and `trash` to safely move items to the trash bin.
- 📦 **Customizable**: Highly configurable with global and project-specific settings.
- 🚀 **Profiles**: Use different cleanup profiles for different project types (e.g., frontend, Rust).

## Goal

- 🎯 **Simplify Project Maintenance**: To provide a single, simple command for cleaning up a project's state.
- 💾 **Free Up Disk Space**: To easily remove large, auto-generated directories like `node_modules`.
- 🔄 **Ensure Clean State**: To help ensure a clean state before a fresh install or build.

## Design Principles

- **User-Friendly**: The interactive prompt makes the tool easy and safe to use, even for destructive operations.
- **Simplicity**: The tool has a single, focused purpose and executes it well.
- **Safety**: Relies on the `trash` library to move items to the system's trash bin, preventing accidental permanent deletion.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To initialize the global configuration file, run:

```bash
bun computer-cleanup init
```

This will create a `computer-cleanup.config.json` file in your home directory.

To start the interactive cleanup wizard, run the `computer-cleanup` command from the monorepo root. Bun will automatically resolve the binary.

```bash
bun computer-cleanup
```

The tool will then:

1. **Scan Current Directory**: It searches for common project artifacts in the directory where you run the command, based on pre-configured patterns.
2. **Display Found Items**: It presents you with an interactive list of all the files and directories it found, along with their respective sizes.
3. **Select and Confirm**: You can use the spacebar to select the items you wish to delete.
4. **Clean Up**: After you confirm your selection, the tool will safely delete the chosen items and report the total disk space saved.

## Configuration

The cleanup tool can be configured at both a global and a project-specific level.

### Configuration

The cleanup tool can be configured at both a global and a project-specific level.

- **Global Configuration**: Run `computer-cleanup init` to create a `computer-cleanup.config.json` in your home directory.
- **Project-Specific Configuration**: Create a `.cleanup.config.json` file in a project's root directory.

These files allow you to define and override cleanup **profiles**. A profile consists of:
- `patterns`: An array of glob patterns to match files/directories (e.g., `"node_modules"`).
- `excludePatterns`: An array of glob patterns to exclude from the scan.

When you run `computer-cleanup`, it always scans the **current directory**. It merges any local and global configurations to determine which profiles and patterns to use, with local settings taking precedence.

## License

This project is licensed under the MIT License.
