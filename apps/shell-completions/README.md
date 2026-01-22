# @wpackages/shell-completions

## Introduction

`@wpackages/shell-completions` is an internal utility for generating shell completion scripts (e.g., for Bash, Zsh, Fish). These scripts provide autocompletion for the various command-line tools within the `wpackages` monorepo, such as `wcheck`, `wtask`, and `git-cli`, significantly improving their usability and discoverability.

## Features

- 🚀 **Automatic Script Generation**: Generates completion scripts based on the command definitions from the CLI tools.
- 🐚 **Multi-Shell Support**: Designed to support common shells like Bash, Zsh, and Fish.
- 🔧 **Easy Integration**: Provides a simple command to generate and install the completion scripts.

## Goal

- 🎯 **Improve CLI Usability**: To make the monorepo's command-line tools easier and faster to use by providing rich autocompletion.
- 🧑‍💻 **Enhance Discoverability**: To help users discover available commands and options without needing to constantly refer to `--help`.

## Design Principles

- **Convention-Based**: The tool is designed to discover CLI tools and their commands based on the conventions of the monorepo.
- **Simple Interface**: A single command is used to generate completions, keeping the user experience straightforward.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To generate and install the shell completion scripts, you would typically run a command provided by this package.

_Note: The following is an example of the intended command-line interface._

```bash
# Generate and install completions for Zsh
bun generate-completions --shell zsh

# Generate and install completions for Bash
bun generate-completions --shell bash
```

After running the command, you may need to restart your shell or source your shell's configuration file (e.g., `.zshrc`, `.bashrc`) for the changes to take effect.

## License

This project is licensed under the MIT License.
