# @wpackages/parser

## Introduction

`@wpackages/parser` is a universal, multi-language parser that provides a single, unified, and functional API to parse over 13 languages. It is designed for performance, type safety, and extensibility, using the high-speed OXC parser for JavaScript/TypeScript and providing full Abstract Syntax Tree (AST) access for deep code analysis.

## Features

- 🌍 **Multi-Language Support**: A single API for 13+ languages, including JS/TS, JSON, YAML, TOML, Markdown, HTML, CSS, and more.
- ⚡ **High-Speed JS/TS Parsing**: Utilizes the Rust-based OXC parser, the fastest available parser for the JavaScript ecosystem.
- 🌳 **Rich AST Access**: Provides full ASTs for code, markup, and style languages, enabling powerful static analysis and code transformation tools.
- 🛡️ **Functional Error Handling**: All parsing operations return a `Result` type, making error handling explicit, predictable, and free of exceptions.
- 🎯 **Automatic Language Detection**: Intelligently detects the language from a file's extension, simplifying the API.
- 🔌 **Extensible**: Features a parser registry that can be extended with custom parsers for additional languages.

## Goal

- 🎯 **Unified Parsing Engine**: To provide a single, consistent interface for parsing any file type required within the monorepo.
- 🚀 **Foundation for Tooling**: To be the high-performance foundation for other developer tools like linters, code generators, and static analyzers.
- ✅ **Safety and Reliability**: To eliminate parsing-related runtime errors through a functional, `Result`-based API.

## Design Principles

- **Performance First**: Leverages the fastest available parsing technology for each language.
- **Functional and Composable**: The API is composed of pure, composable functions with no side effects.
- **Pluggable Architecture**: A central parser registry allows for easy extension and management of language-specific parsers.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The `parse` and `parseFile` functions are the main entry points. They automatically detect the language and return a structured result.

### Example: Universal Parsing

```typescript
import { parseFile, Result } from "@wpackages/parser";

// This will auto-detect the language as YAML and parse the file.
const result = await parseFile("./config.yaml");

if (Result.isOk(result)) {
	console.log("Language:", result.value.language); // 'yaml'
	console.log("Parsed Data:", result.value.data);
} else {
	console.error("Parsing failed:", result.error);
}
```

### Example: Accessing the AST

For languages with AST support, the `data` field will contain the Abstract Syntax Tree.

```typescript
import { parse, Result } from "@wpackages/parser";

const tsCode = "const x: number = 42;";
const result = parse(tsCode, "my-file.ts");

if (Result.isOk(result) && result.value.language === "typescript") {
	// The 'data' property is the OXC AST
	const ast = result.value.data;
	console.log("AST Program:", ast.program);
}
```

## License

This project is licensed under the MIT License.
