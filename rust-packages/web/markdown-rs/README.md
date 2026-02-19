# 🦀 Markdown-RS

A **high-performance** Rust-powered Markdown parser with Node.js bindings via NAPI-rs. Built with `pulldown-cmark` for blazing fast parsing and rendering.

## ✨ Features

- ⚡ **Blazing Fast** - Rust-powered parsing with minimal overhead
- 🎨 **Syntax Highlighting** - Built-in code block highlighting using `syntect`
- 📑 **Table of Contents** - Automatic TOC generation with `[toc]` marker
- 📝 **GFM Support** - GitHub Flavored Markdown with tables, strikethrough, task lists
- 📚 **Footnotes** - Full footnote support
- 🔒 **HTML Sanitization** - Safe HTML output with `ammonia`
- 🔌 **Extensible Plugins** - Modular plugin architecture

## 📦 Installation

```bash
bun add markdown-rs
```

## 🚀 Usage

### Basic Rendering

```javascript
import { parse, render, renderGfm } from "markdown-rs";

// Parse markdown to AST (JSON string)
const ast = parse("# Hello, World!");

// Basic render
const html = render("# Hello, World!");
// Output: "<h1>Hello, World!</h1>"

// GFM render (tables, strikethrough, task lists, footnotes)
const gfmHtml = renderGfm(`
| Name  | Status |
|-------|--------|
| Task 1 | ✅    |
| Task 2 | ⬜    |
`);
```

### Advanced Options

```typescript
import { renderWithOptions } from "markdown-rs";

const html = renderWithOptions(markdown, {
  sanitize: true,          // Sanitize HTML output
  syntaxHighlight: true,   // Enable syntax highlighting
  toc: true,               // Generate table of contents
  gfm: true,               // Enable GFM features
  footnotes: true,         // Enable footnotes
  directives: false,       // Enable directive plugins
});
```

### Table of Contents

```javascript
import { renderWithOptions } from "markdown-rs";

const markdown = `
[toc]

# Main Title

## Section 1

### Subsection 1.1

## Section 2
`;

const html = renderWithOptions(markdown, { toc: true });
// Generates nested <ul> list with anchor links
```

### Footnotes

```javascript
import { renderWithOptions } from "markdown-rs";

const markdown = `
Here is a footnote reference,[^1] and another.[^longnote].

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.
`;

const html = renderWithOptions(markdown, { footnotes: true });
```

## 📖 API Reference

### `parse(input: string): string`

Parse markdown to AST (returned as JSON string).

### `render(input: string): string`

Render markdown to HTML with syntax highlighting.

### `renderGfm(input: string): string`

Render markdown with full GFM support (tables, strikethrough, task lists, footnotes).

### `renderWithOptions(input: string, options?: RenderOptions): string`

Render markdown with custom options.

#### `RenderOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sanitize` | `boolean` | `true` | Sanitize HTML output |
| `syntaxHighlight` | `boolean` | `true` | Enable code syntax highlighting |
| `toc` | `boolean` | `false` | Generate table of contents |
| `gfm` | `boolean` | `true` | Enable GFM features |
| `footnotes` | `boolean` | `false` | Enable footnotes |
| `directives` | `boolean` | `false` | Enable directive plugins |

## 🔧 Development

```bash
# Install dependencies
bun install

# Build native module
bun run build

# Run tests
bun test

# Run benchmarks
bun run bench          # Node.js benchmarks
bun run bench:rust     # Rust benchmarks

# Lint Rust code
bun run lint

# Clean build artifacts
bun run clean
```

## 📊 Benchmarks

Benchmarks compare `markdown-rs` against popular JavaScript markdown parsers:

- `markdown-it`
- `marked`
- `remarkable`
- `showdown`
- `pulldown-cmark-wasm`
- `comrak`

Run benchmarks:

```bash
bun run bench
```

Results are saved to `benches/results.html` and `benches/results.json`.

## 🏗️ Architecture

```
src/
├── app/              # Application orchestration
│   └── markdown_orchestrator.rs
├── adapters/         # Parser adapters
│   └── pulldown_cmark/
├── components/       # Core components
│   ├── ast.rs
│   ├── render.rs
│   ├── toc.rs
│   └── plugins/      # Plugin implementations
│       ├── syntax_highlighting.rs
│       └── toc.rs
├── config/           # Configuration
├── error/            # Error handling
└── lib.rs            # NAPI bindings
```

## 📄 License

MIT
