# @wpackages/file-operation

## Introduction

`@wpackages/file-operation` is a high-performance command-line utility for file system operations, written in Rust. It is inspired by a suite of modern CLI tools like `fd`, `rg`, `sd`, `yazi`, and `zoxide`, aiming to provide a single, cohesive, and fast tool for common file-related tasks.

## Features

- ⚡ **Blazing Fast**: Built with Rust for maximum performance and memory safety.
- 🔍 **Powerful Search**: Includes functionalities for both file name searching (like `fd`) and content searching (like `rg`).
- 📂 **Directory Traversal**: Efficiently walks directory trees using the `walkdir` crate.
- 🛠️ **Intuitive CLI**: A user-friendly command-line interface powered by the `clap` argument parser.
- 🧩 **Modular Design**: Aims to combine the best features of several tools into one unified experience.

## Goal

- 🎯 **Unified Tooling**: To provide a single binary that covers a wide range of common file system operations, reducing the need to install and learn multiple different tools.
- 🚀 **Peak Performance**: To offer a faster alternative to traditional shell commands like `find` and `grep`.
- 🧑‍💻 **Ergonomic Interface**: To design a CLI that is intuitive, easy to remember, and pleasant to use.

## Design Principles

- **Performance First**: Every feature is implemented with performance as a primary consideration.
- **Sensible Defaults**: The tool is designed to be useful out of the box with minimal configuration.
- **Cross-Platform**: Aims to be fully functional on Windows, macOS, and Linux.

## Installation

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)

### Building from Source

Clone the repository and build the project using Cargo:

```bash
# Navigate to the package directory
cd cli/file-operation

# Build the release binary
cargo build --release

# The executable will be in ./target/release/file-operation
```

## Usage

The tool will be structured with subcommands for different operations.

_Note: The following examples are illustrative of the intended functionality._

### Find Files (like `fd`)

```bash
# Find all files with a .ts extension
file-operation find .ts

# Find files named 'README.md'
file-operation find README.md
```

### Search File Contents (like `rg`)

```bash
# Search for the string 'import type' in TypeScript files
file-operation search "import type" --glob "*.ts"
```

## License

This project is licensed under the MIT License.
