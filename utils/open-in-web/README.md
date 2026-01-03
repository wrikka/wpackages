# open-in-web

A tool to open Markdown files in web browser using Bun

## Design Principles

- **Simple**: Easy to use with single command
- **Fast**: Powered by Bun for high performance
- **Modern**: Renders Markdown with marked.js

## Installation

| Package Manager | Command                   |
| --------------- | ------------------------- |
| npm             | `npm install open-in-web` |
| pnpm            | `pnpm add open-in-web`    |
| yarn            | `yarn add open-in-web`    |
| bun             | `bun add open-in-web`     |

## Usage

```bash
open-in-web <file.md> [--port 3000]
```

## Examples

### Preview Markdown File

```bash
open-in-web README.md
# Opens at http://localhost:3000
```

### Preview with Custom Port

```bash
open-in-web docs/getting-started.md --port 8080
# Opens at http://localhost:8080
```

### Error Cases

```bash
open-in-web # Shows "Please specify a markdown file"
open-in-web example.txt # Shows "Please provide a .md file"
open-in-web missing.md # Shows "File not found"
```

## License

MIT
