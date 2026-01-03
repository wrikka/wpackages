# @wpackages/code-search

## Introduction

`@wpackages/code-search` is a high-performance, programmatic code search and analysis service. Instead of relying on simple text or regex matching, it leverages Abstract Syntax Trees (ASTs) to perform structural searches on code. This allows for more powerful, precise, and context-aware queries. The service is powered by high-speed Rust-native libraries like `@ast-grep/napi` and `oxc-parser`.

## Features

- 🌳 **AST-Based Searching**: Perform structural searches on code, understanding its syntax and structure rather than just its text.
- 🚀 **High Performance**: Utilizes native-speed parsers and search algorithms for extremely fast code analysis.
- 🎯 **Precise Queries**: Find specific code patterns with high accuracy, avoiding the false positives common with text-based search.
- 🔧 **Powered by `ast-grep`**: Integrates the powerful `ast-grep` engine for pattern matching on ASTs.
- 🧩 **Extensible**: Designed to be a foundational service for other tools like custom linters, refactoring scripts, and code analysis utilities.

## Goal

- 🎯 **Powerful Code Analysis**: To provide a programmatic API for deep, structural analysis of the codebase.
- 🤖 **Enable Automation**: To be the engine for automated code refactoring, linting, and migration tools.
- ⚡ **Speed and Accuracy**: To offer a search solution that is both significantly faster and more accurate than traditional text-based tools.

## Design Principles

- **Structural over Textual**: Prioritizes understanding the structure of code over its raw text representation.
- **Performance-Critical**: Built on a foundation of high-performance, native-speed libraries.
- **API-First**: Designed as a service to be consumed by other tools and scripts within the monorepo.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The service exposes functions to parse and search code files.

### Example: Finding a Specific Function Call

```typescript
import { searchCode } from "@wpackages/code-search";

// Define a search pattern using ast-grep's syntax
const pattern = `myFunction($ARG)`;

// Search for all calls to 'myFunction' in a specific file
const results = await searchCode({
	pattern,
	filePath: "./src/some-file.ts",
});

console.log("Found matches:", results);

// results might look like:
// [
//   {
//     filePath: './src/some-file.ts',
//     line: 10,
//     column: 5,
//     matchedNode: 'myFunction(42)'
//   }
// ]
```

## License

This project is licensed under the MIT License.
