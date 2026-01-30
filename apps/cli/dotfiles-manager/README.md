# @wpackages/dotfiles-manager

## Introduction

`@wpackages/dotfiles-manager` is a simple, modern, and interactive dotfiles manager inspired by `chezmoi`. It provides an easy-to-use command-line interface, powered by `@clack/prompts`, to help you manage, track, and synchronize your configuration files (dotfiles) across multiple machines.

## Features

- ✨ **Interactive CLI**: A beautiful and intuitive user interface for all commands.
- 📦 **Simple File Management**: Easily `add` and `remove` configuration files to be tracked.
- 🔄 **Synchronization**: Supports two-way synchronization: apply tracked files to your local system (`sync-local`) and push changes to a remote Git repository (`sync-remote`).
- 🔒 **Type-Safe**: Uses `Zod` for validating the configuration file, ensuring its integrity.
- 🎨 **Modern UI**: A clean and colorful terminal experience using `picocolors`.

## Goal

- 🎯 **Simplicity**: To offer a simpler, more user-friendly alternative to powerful but complex tools like `chezmoi`.
- 🧑‍💻 **Great DX**: To provide a delightful and intuitive experience for managing dotfiles.
- ✅ **Reliability**: To be a reliable tool for keeping your development environment consistent across different machines.

## Design Principles

- **Interactive First**: The primary interface is an interactive prompt, making the tool accessible and easy to learn.
- **Single Config File**: All state is managed in a single JSON file (`~/.dotfile-manager.json`), making it easy to inspect and edit.
- **Convention over Configuration**: Makes sensible assumptions about your setup (e.g., storing dotfiles in `~/.dotfiles`) to minimize configuration.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The tool is run via the `wdotfiles` command.

```bash
# Run from the monorepo root
bun wdotfiles
```

### Commands

- `init`: Initialize the dotfiles manager and create the configuration file.
- `add <file>`: Add a file to be tracked.
- `remove <file>`: Stop tracking a file.
- `sync-local`: Apply changes from your dotfiles directory to your local system.
- `sync-remote`: Push changes to your remote Git repository.
- `open`: List all currently managed dotfiles.

### Configuration File

The configuration and state are stored in `~/.dotfile-manager.json`.

```json
{
	"dotfilesDir": "~/.dotfiles",
	"files": [
		{
			"source": "/home/user/.zshrc",
			"target": "/home/user/.dotfiles/.zshrc"
		}
	],
	"remote": {
		"url": "https://github.com/user/dotfiles.git",
		"branch": "main"
	}
}
```

## License

This project is licensed under the MIT License.
