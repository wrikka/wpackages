# @wpackages/file-download

## Introduction

`@wpackages/file-download` is a convenient command-line tool for downloading files from various sources, including direct URLs and raw GitHub file links. It features a user-friendly interactive interface that guides you through the process of specifying the source URL and the destination file path.

## Features

- ✨ **Interactive CLI**: A simple and intuitive wizard powered by `@clack/prompts` makes downloading files effortless.
- 🔗 **Multiple Source Types**: Supports downloading from standard URLs and can intelligently handle raw GitHub content URLs.
- 📂 **Flexible Destination**: Allows you to specify the exact output path and filename for the downloaded file.
- 🔒 **Type-Safe**: Uses `Zod` for internal validation, ensuring robustness.

## Goal

- 🎯 **Simplify Downloads**: To provide a single, easy-to-use command for fetching remote files without needing `curl` or `wget` and manually saving the output.
- 🧑‍💻 **Great DX**: To offer a pleasant and interactive command-line experience for a common development task.

## Design Principles

- **User-Friendly**: The interactive prompt is the primary mode of operation, making the tool accessible to everyone.
- **Focused**: The tool is designed to do one thing well: download a file from a URL to a specified location.
- **Simplicity**: Avoids complex flags and configuration in favor of a straightforward interactive flow.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

To start the interactive download wizard, run the `wdownload` command from the monorepo root. Bun will automatically resolve the binary.

```bash
bun wdownload
```

The tool will then prompt you for the following information:

1. **File URL**: The URL of the file you want to download (e.g., a direct link or a GitHub raw file link).
2. **Output Path**: The local path where you want to save the file (e.g., `./downloads/my-file.txt`).

After you provide the details, the tool will download the file and save it to your specified location.

## License

This project is licensed under the MIT License.
