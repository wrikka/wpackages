# file-system

A robust file system utility library for Node.js environments, providing a comprehensive set of tools for file and directory manipulation.

## Installation

```bash
bun add file-system
```

## Features

- **File Operations**: Read, write, copy, move, and delete files asynchronously.
- **Directory Management**: Create, list, and remove directories recursively.
- **Path Manipulation**: Utilities for joining, resolving, and normalizing paths.
- **File Watching**: Monitor files and directories for changes.

## Usage

```typescript
import { readFile, writeFile } from "file-system";

async function main() {
	// Write to a file
	await writeFile("example.txt", "Hello, world!");

	// Read from a file
	const content = await readFile("example.txt", "utf8");
	console.log(content);
}

main();
```
