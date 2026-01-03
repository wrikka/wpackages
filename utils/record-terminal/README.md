# @wpackages/record-terminal

## Introduction

`@wpackages/record-terminal` is a command-line tool for recording terminal sessions and converting them into high-quality GIF or MP4 files. It features a simple, interactive interface and a high-performance core written in Rust (compiled to WebAssembly) to ensure efficient recording and processing.

## Features

- ⏺️ **Interactive Recording**: A simple wizard powered by `@clack/prompts` guides you through starting and stopping your recording.
- 🎞️ **Multiple Output Formats**: Save your terminal session as either an animated GIF or an MP4 video.
- 🚀 **High Performance**: The core recording and processing logic is written in Rust and compiled to WASM for near-native performance.
- 🔧 **Simple CLI**: A single command (`record-terminal`) to start the recording process.

## Goal

- 🎯 **Easy Demos**: To make it incredibly simple to create high-quality demos and tutorials of command-line applications.
- 🧑‍💻 **Developer Tooling**: To provide a powerful, integrated tool for developers to showcase their work.
- ⚡ **Performance**: To create a terminal recorder that is fast and has a low resource footprint.

## Design Principles

- **Simplicity**: The user interface is designed to be as simple as possible, with a focus on a single, clear workflow.
- **Performance**: Leverages Rust and WebAssembly for the performance-critical parts of the application.
- **Hybrid Architecture**: Combines a user-friendly TypeScript CLI with a high-performance Rust core.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To start the interactive recording wizard, run the `record-terminal` command from the monorepo root.

```bash
bun record-terminal
```

The tool will then prompt you for the following:

1. **Output File Path**: Where to save the recording (e.g., `./demo.gif`).
2. **Output Format**: Choose between GIF and MP4.

It will then start recording your terminal session. Press `Enter` when you are finished to stop the recording and generate the output file.

## License

This project is licensed under the MIT License.
