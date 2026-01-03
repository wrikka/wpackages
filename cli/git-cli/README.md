# @wpackages/git-cli

## Introduction

`@wpackages/git-cli` is an interactive command-line tool designed to simplify common Git operations. It provides a user-friendly, prompt-based interface that guides you through complex commands, reducing the need to memorize cryptic Git flags. It is built with `@clack/prompts` and is powered by the `@wpackages/git` service for its underlying logic.

## Features

- ✨ **Interactive Interface**: A beautiful and intuitive wizard for common Git commands like commit, push, pull, and branching.
- 🤖 **AI-Powered Commit Messages**: (Optional) Integrates with OpenAI to automatically generate descriptive commit messages based on your staged changes.
- simplifying **Simplifies Complex Operations**: Guides you through multi-step processes like creating a new branch, stashing changes, and creating pull requests.
- 🔧 **Powered by `@wpackages/git`**: Leverages the robust, underlying Git service for all its operations.

## Goal

- 🎯 **Improve Git DX**: To provide a more intuitive and less error-prone way to interact with Git.
- 🧑‍💻 **Lower Barrier to Entry**: To help developers who are less familiar with Git's command-line interface to perform common tasks confidently.
- 🚀 **Increase Productivity**: To speed up common workflows by reducing the time spent looking up Git commands and options.

## Design Principles

- **Interactive-First**: The primary mode of interaction is through a series of clear, guided prompts.
- **User-Friendly**: The tool is designed to be self-explanatory, with clear descriptions for each action.
- **Safe**: Operations that can be destructive (like force-pushing) are clearly marked and require confirmation.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To start the interactive Git wizard, run the `git-cli` command from the monorepo root.

```bash
bun git-cli
```

This will launch an interactive menu that allows you to choose from a variety of Git operations, such as:

- **Commit**: Stage files and write a commit message (with optional AI assistance).
- **Push**: Push your changes to a remote repository.
- **Pull**: Fetch and merge changes from a remote.
- **Branch**: Create, switch, or delete branches.
- **And more...**

## License

This project is licensed under the MIT License.
