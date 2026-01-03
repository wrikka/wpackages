# @wpackages/github-cli

## Introduction

`@wpackages/github-cli` is an interactive command-line tool for synchronizing files with a GitHub repository. It provides a user-friendly, prompt-based interface to manage operations like fetching remote files, checking for updates, and pushing local changes back to the repository. It uses `octokit` to communicate with the GitHub API.

## Features

- ✨ **Interactive Interface**: A beautiful and intuitive wizard powered by `@clack/prompts` for all operations.
- 🔄 **File Synchronization**: Easily sync files between your local machine and a remote GitHub repository.
-
  - **GitHub Integration**: Uses `octokit` for robust and reliable communication with the GitHub API.
- 🤖 **AI Assistance**: (Optional) Can leverage `openai` for features like generating commit messages or summarizing changes.

## Goal

- 🎯 **Simplify GitHub Workflows**: To abstract away complex Git commands and provide a simple, task-oriented interface for managing files in a GitHub repository.
- 🧑‍💻 **Improve DX**: To offer a pleasant and guided experience for common GitHub file operations.
- ✅ **Reliability**: To ensure that file synchronization is performed safely and correctly.

## Design Principles

- **Interactive-First**: The primary interface is a series of guided prompts, making the tool easy to use without memorizing flags.
- **API-Driven**: All operations are performed via the official GitHub API through `octokit`.
- **Focused**: The tool is designed specifically for file synchronization tasks.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To start the interactive synchronization wizard, run the `github-sync` command from the monorepo root. You will need to have a GitHub personal access token with the appropriate permissions configured in your environment variables.

```bash
# Ensure GITHUB_TOKEN is set in your environment
bun github-sync
```

This will launch an interactive menu that guides you through the process of selecting a repository, choosing files to sync, and confirming the operation.

## License

This project is licensed under the MIT License.
