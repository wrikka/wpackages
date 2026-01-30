# @wpackages/web-to-desktop

## Introduction

`@wpackages/web-to-desktop` is a powerful command-line tool that converts any website into a lightweight, cross-platform desktop application. It leverages the [Tauri](https://tauri.app/) framework to create fast, secure, and resource-efficient applications with a native look and feel.

## Features

- 🗣️ **Interactive CLI**: An easy-to-use wizard, powered by `@clack/prompts`, guides you through the entire setup process.
- 🚀 **Powered by Tauri**: Generates applications that are significantly smaller and more performant than Electron-based alternatives.
- 🎨 **Customizable**: Allows you to configure window size, resizability, application name, and other essential properties.
- 🛠️ **Automatic Scaffolding**: Creates a complete Tauri project structure, ready for further customization or immediate building.

## Goal

- 🎯 **Simplicity**: To make the process of turning a website into a desktop app as simple as answering a few questions.
- ⚡ **Performance**: To generate desktop applications that are fast, lightweight, and have a minimal memory footprint.
- 👨‍💻 **Developer Experience**: To provide a smooth and intuitive command-line experience for developers.

## Design Principles

- **User-Centric**: The CLI is designed to be interactive and user-friendly, requiring no prior knowledge of Tauri.
- **Minimalist Output**: The generated project contains only the essential files needed to run the Tauri application.
- **Standardization**: The created project follows standard Tauri conventions, making it easy for developers to extend and maintain.

## Installation

This tool is an internal package within the `wpackages` monorepo. Ensure all root dependencies are installed:

```bash
# From the monorepo root
bun install
```

The `wtd` command is made available via the `bin` field in `package.json`.

## Usage

To start the interactive setup wizard, run the following command from the monorepo root. Bun will automatically resolve the `wtd` binary.

```bash
bun wtd
```

The wizard will then prompt you for the following information:

1. **Website URL**: The URL of the website you want to convert.
2. **Application Name**: The name for your desktop application.
3. **Window Dimensions**: The initial width and height of the application window.
4. **Window Options**: Whether the window should be resizable, have a menu bar, etc.

After you provide the details, the tool will scaffold a new Tauri project in your current directory.

## Examples

### Running the Wizard

```bash
# Run from the monorepo root
bun wtd

# Follow the interactive prompts:
# ? What is the URL of the website? › https://example.com
# ? What is the name of your application? › My Awesome App
# ? Enter the window width: › 1280
# ? Enter the window height: › 720
# ... and so on
```

### Development Commands

To work on the `web-to-desktop` tool itself:

```bash
# Run the CLI in watch mode
turbo dev --filter=@wpackages/web-to-desktop

# Build the CLI
turbo build --filter=@wpackages/web-to-desktop

# Run tests
turbo test --filter=@wpackages/web-to-desktop
```

## License

This project is licensed under the MIT License.
