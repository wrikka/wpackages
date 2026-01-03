# @wpackages/task-manager

## Introduction

`@wpackages/task-manager` is a command-line task manager for organizing and tracking your work. It features a simple, interactive interface for adding, viewing, and managing tasks, making it easy to stay on top of your to-do list directly from the terminal.

## Features

- ✨ **Interactive CLI**: A beautiful and intuitive user interface powered by `@clack/prompts` for managing tasks.
- ✅ **Simple Task Management**: Easily add, list, and complete tasks.
- 📂 **Persistent Storage**: Tasks are saved to a local file (e.g., `.tasks.ini` or `.tasks.toml`) in your project directory.
- 🔧 **Multiple Format Support**: Supports both INI and TOML file formats for storing tasks.

## Goal

- 🎯 **Streamline Workflow**: To provide a simple, terminal-based tool for task management that integrates seamlessly into a developer's workflow.
- 🧑‍💻 **Frictionless Tasking**: To make the process of creating and tracking tasks as quick and easy as possible.

## Design Principles

- **Simplicity**: The tool is designed to be minimal and focused, providing only the essential features for task management.
- **Interactive-First**: The primary way to interact with the tool is through its interactive prompts, making it easy to learn and use.
- **Local-First**: Task data is stored locally in the project directory, with no need for an external service.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The tool is run via the `wtask` command from the monorepo root.

```bash
bun wtask
```

This will launch an interactive menu with the following options:

- **Add a new task**: Prompts you to enter a description for a new task.
- **List all tasks**: Displays all current tasks, separated by their status (pending/completed).
- **Complete a task**: Shows a list of pending tasks and allows you to mark one as complete.
- **Exit**: Closes the task manager.

## License

This project is licensed under the MIT License.
