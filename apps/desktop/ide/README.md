# IDE App 💻

## Introduction

IDE App is a Rust-native desktop application built with egui/eframe that provides IDE-like capabilities focused on Git inspection and read-only file exploration. It offers a lightweight, fast alternative to full-featured IDEs for code review and repository analysis tasks. With its pure Rust implementation, it delivers exceptional performance without the overhead of webview-based applications, making it ideal for quick code reviews, repository navigation, and Git history exploration.

## Features

- 📊 **Git Repository Inspection**: Browse and analyze Git repositories with ease
- 🌳 **Branch Management**: View and switch between branches
- 📝 **Commit History**: Explore commit history and changes
- 🔍 **Diff Viewer**: View diffs against HEAD or between commits
- 📁 **File Explorer**: Read-only file browsing with syntax highlighting
- 🚀 **High Performance**: Native Rust implementation for maximum speed
- 🎨 **Native UI**: Built with egui for a smooth, responsive experience
- 🔒 **Type Safe**: Strongly typed DTOs and explicit error handling
- 🏗️ **Clean Architecture**: Functional Rust layering with types + services + app
- 🎯 **Focused Functionality**: Specialized in Git inspection rather than full IDE features

## Goals

- 🎯 Provide a fast, lightweight tool for Git repository inspection
- 🔍 Enable efficient code review and analysis workflows
- 📊 Offer comprehensive Git visualization and exploration
- ⚡ Deliver a responsive native application without webview overhead
- 🦀 Leverage Rust's performance and safety guarantees
- 🛡️ Ensure read-only file browsing to reduce risk of accidental changes
- 🎨 Provide simple, elegant UI focused on essential functionality
- 🌐 Ensure cross-platform support (Windows, macOS, Linux)
- 🔒 Maintain type safety and security
- 📊 Provide comprehensive observability and monitoring

## Design Principles

- 🦀 **Rust-Native UI**: No webview, no Vue/TypeScript - pure Rust implementation
- 🏗️ **Functional Rust Layering**: Clean architecture with `types` + `services` + `app` composition
- 🔒 **Type Safety**: Strongly typed DTOs and explicit error handling throughout
- 🛡️ **Read-Only by Default**: File browsing is read-only to reduce risk of accidental changes
- 🎯 **Focused Functionality**: Specialized in Git inspection rather than full IDE features
- ⚡ **Performance First**: Native implementation for maximum speed and responsiveness
- 🎨 **Simple & Elegant**: Minimal UI focused on essential functionality

## Installation

<details>
<summary>Prerequisites</summary>

- Rust toolchain (stable or nightly)
- Bun package manager
- Git (for repository inspection)

</details>

<details>
<summary>Install Dependencies</summary>

Install dependencies at the monorepo root:

```bash
bun install
```

</details>

<details>
<summary>Build from Source</summary>

```bash
# Navigate to app directory
cd apps/ide

# Build in development mode
cargo build

# Build in release mode
cargo build --release
```

</details>

## Usage

### Development Mode

```bash
# From root directory
bun --cwd apps/ide run dev

# Or directly from the package folder
cd apps/ide
cargo run
```

### Build for Production

```bash
# Default build
bun --cwd apps/ide run build

# Platform-specific builds
bun --cwd apps/ide run build:windows
bun --cwd apps/ide run build:wasm
bun --cwd apps/ide run build:node
```

### Testing

```bash
# Run tests
bun --cwd apps/ide run test
```

### Linting and Formatting

```bash
# Format code
bun --cwd apps/ide run format

# Run linter
bun --cwd apps/ide run lint

# Run full verification
bun --cwd apps/ide run verify
```

## Examples

### Launching the App

```bash
cd apps/ide
cargo run
```

### Basic Workflow

```bash
# 1. Launch the app
cargo run

# 2. Click "Open Folder"
# 3. Select a folder containing one or more Git repositories
# 4. Inspect:
#    - Repository list
#    - Branches
#    - Commits
#    - Status
#    - Diff against HEAD
#    - File list and read file contents
```

### Building for Different Platforms

```bash
# Windows
cargo build --release --target x86_64-pc-windows-msvc

# WASM
wasm-pack build --out-dir ./pkg

# Node.js (N-API)
napi build --platform --release
```

### Using the App

```rust
// The app provides:
// - Git repository browsing
// - Commit history visualization
// - Diff viewing
// - File content inspection
// - Branch management

// All operations are read-only to prevent accidental changes
```

## License

This project is licensed under the MIT License.
