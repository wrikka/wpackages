# Desktop App 🖥️

## Introduction

WAI Desktop is a Tauri-based desktop application that provides a modern, cross-platform interface for the WAI ecosystem. Built with Nuxt 4, Vue 3, and UnoCSS, it serves as both a standalone web UI and the frontend for Tauri desktop apps, offering a seamless experience across web and desktop environments. The application features integrated terminal emulator, Git integration, and MCP development support, making it a comprehensive tool for AI-powered development workflows.

## Features

- 🖥️ **Cross-Platform Desktop App**: Built with Tauri for Windows, macOS, and Linux
- 🌐 **Web UI**: Standalone web interface accessible from any browser
- ⚡ **Modern Stack**: Powered by Nuxt 4, Vue 3, and UnoCSS
- 🎨 **Beautiful UI**: Modern design with dark mode support
- 📝 **Terminal Integration**: Integrated xterm terminal emulator for command-line operations
- 🔌 **MCP Support**: Built-in Model Context Protocol development support
- 🚀 **Fast Development**: Hot module replacement and instant updates
- 📊 **Git Integration**: Read-only file explorer with Git history
- 🎯 **Unified Interface**: Single UI for multiple desktop applications
- 🔒 **Type Safety**: Full TypeScript support throughout

## Goals

- 🎯 Provide a unified interface for WAI tools across web and desktop
- 🖥️ Deliver a native desktop experience with web technologies
- ⚡ Enable rapid development with modern tooling and hot reloading
- 🔧 Support extensibility through MCP and plugin architecture
- 📝 Integrate terminal and Git workflows seamlessly
- 🎨 Create beautiful, responsive UI that works everywhere
- 🌐 Ensure cross-platform support (Windows, macOS, Linux)
- 🔒 Maintain type safety and security
- 📊 Provide comprehensive observability
- 🧩 Enable modular and reusable components

## Design Principles

- 🔄 **Single UI for Multiple Apps**: Desktop apps can reuse this UI to reduce duplication
- 🛠️ **Tauri-Friendly Dev Experience**: Fixed port and `clearScreen: false` for readable Tauri logs
- 🔒 **Type Safety**: TypeScript throughout the frontend for robust development
- 🎨 **Modern UI/UX**: Leverage Vue 3 Composition API and UnoCSS for styling
- 📦 **Modular Architecture**: Organized components and composables for maintainability
- ⚡ **Performance First**: Optimized for fast startup and smooth interactions
- 🌐 **Cross-Platform**: Consistent experience across Windows, macOS, and Linux

## Installation

<details>
<summary>Prerequisites</summary>

- Node.js 18+ or Bun 1.0+
- Rust toolchain (for Tauri desktop builds)
- System dependencies for Tauri (varies by platform)

</details>

<details>
<summary>Install Dependencies</summary>

Install dependencies at the monorepo root:

```bash
bun install
```

</details>

<details>
<summary>Platform-Specific Setup</summary>

#### Windows
No additional setup required

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
# Install webkit2gtk and other dependencies
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

</details>

## Usage

### Development

To run the application in development mode, which will launch the Tauri desktop app with hot reloading, use the following command:

```bash
# From the monorepo root
bun --cwd apps/desktop run dev
```

### Production Build

```bash
# Build web UI
bun --cwd apps/desktop run build

# Generate static site
bun --cwd apps/desktop run generate

# Preview production build
bun --cwd apps/desktop run preview
```

### Desktop App Build

```bash
# Build Tauri app for current platform
bunx --cwd apps/desktop tauri build

# Build for specific platforms
bunx --cwd apps/desktop tauri build --target x86_64-pc-windows-msvc
bunx --cwd apps/desktop tauri build --target x86_64-apple-darwin
bunx --cwd apps/desktop tauri build --target x86_64-unknown-linux-gnu
```

### Linting

```bash
# Run the linter and type checker
bun --cwd apps/desktop run lint
```

## Examples

### Running the Web UI

```bash
cd apps/desktop
bun run dev
```

Navigate to `http://localhost:3001/` and use the sidebar to:
- `/terminal` - Integrated terminal emulator
- `/ide` - Git + read-only file explorer

### Running the Desktop App

```bash
cd apps/desktop
bun run dev
```

The Tauri app will launch with the same UI running natively.

### Using the Terminal

```typescript
// The terminal integrates xterm for full terminal emulation
// Accessible via /terminal route
// Supports:
// - Full shell commands
// - Multiple tabs
// - Custom themes
// - Copy/paste functionality
```

### Git Integration

```typescript
// The IDE view provides:
// - File browser with Git status
// - Commit history viewer
// - Branch visualization
// - Diff viewing
```

## License

This project is licensed under the MIT License.
