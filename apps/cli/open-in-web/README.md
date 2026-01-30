# @wpackages/open-in-web

## Introduction

`@wpackages/open-in-web` is a command-line tool that renders a local Markdown file and opens it in your default web browser for a live preview. It's built with Bun and serves the rendered HTML on a local server. It supports rich Markdown features, including syntax highlighting, diagrams, and mathematical formulas.

## Features

- 🚀 **Fast Local Server**: Powered by Bun for high-performance file serving.
- 💅 **Rich Markdown Rendering**: Uses `markdown-it` with plugins for:
  - Syntax highlighting via `shiki`.
  - Diagrams via `markdown-it-mermaid`.
  - Math formulas via `markdown-it-mathjax3`.
  - Table of contents and anchors.
- ✨ **Simple CLI**: A single command to preview any Markdown file.
- 🔧 **Customizable Port**: Specify a custom port for the local server.

## Goal

- 🎯 **Quick Previews**: To provide a fast and easy way to preview Markdown files with rich formatting that might not be available in a standard editor preview.
- 🧑‍💻 **Simple Tooling**: To offer a simple, zero-config tool for a common development task.

## Design Principles

- **Simplicity**: The tool is designed to be as simple as possible, with a single command and minimal options.
- **High Fidelity**: Aims to render Markdown with a rich feature set, closely resembling how it might look on a documentation site or blog.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The tool provides the `ow` (Open Web) command.

```bash
# Preview a Markdown file on the default port (3000)
bun ow README.md

# Preview a file on a custom port
bun ow docs/guide.md --port 8080
```

### Options

- `<file>`: (Required) The path to the Markdown file to preview.
- `--port`: (Optional) The port to use for the local server. Defaults to `3000`.

## License

This project is licensed under the MIT License.
