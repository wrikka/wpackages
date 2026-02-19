# @wpackages/generate-readme

Automated README.md generation tool for documenting patterns, paradigms, and code structures

## Overview

`@wpackages/generate-readme` is a specialized tool that automatically generates comprehensive README.md documentation by scanning source code for patterns, paradigms, and metadata. It extracts structured information from TypeScript files and creates organized documentation tables with categorization and usage details.

## Features

- 📚 **Pattern Discovery**: Automatically scans and categorizes design patterns
- 🏗️ **Paradigm Detection**: Identifies programming paradigms (functional, OOP, etc.)
- 📊 **Table Generation**: Creates structured markdown tables with metadata
- 🏷️ **Tag-based Classification**: Organizes content by tags and categories
- 🔍 **Metadata Extraction**: Pulls descriptions and usage information from code
- 📁 **Flexible Scanning**: Supports custom glob patterns for file discovery
- 🎯 **Focused Documentation**: Ignores test files and indexes automatically

## Installation

```bash
bun install @wpackages/generate-readme
```

## Usage

### CLI Usage

```bash
# Generate README for current directory
bunx @wpackages/generate-readme

# Generate with custom patterns
bunx @wpackages/generate-readme --patterns "src/**/*.ts"

# Generate with custom output
bunx @wpackages/generate-readme --output CUSTOM_README.md
```

### Programmatic Usage

```typescript
import { generateReadme } from '@wpackages/generate-readme';

// Generate with default settings
await generateReadme();

// Generate with custom options
await generateReadme({
  patterns: ['src/patterns/**/*.ts', 'src/paradigms/**/*.ts'],
  output: 'README.md',
  ignore: ['**/*.test.ts', '**/*.usage.ts'],
  categorize: {
    patterns: {
      creational: /\/creational\//,
      structural: /\/structural\//,
      behavioral: /\/behavioral\//,
    },
    paradigms: /\/paradigms\//
  }
});
```

## Pattern Metadata Format

Add metadata to your TypeScript files using the PatternMetadata interface:

```typescript
import type { PatternMetadata } from '@wpackages/generate-readme';

export const metadata: PatternMetadata = {
  name: 'Singleton',
  description: 'Ensures a class has only one instance and provides global access to it.',
  tags: ['creational', 'stateful', 'server'],
  examples: [
    'Database connection pool',
    'Logger instance',
    'Configuration manager'
  ]
};

// Your pattern implementation here
export class Singleton {
  // ...
}
```

## Generated Output Structure

The tool generates a markdown table with the following columns:

| Pattern | Category | Paradigm | Style | Environment | Use Case |
|---|---|---|---|---|---|
| **PatternName** | creational | fp | functional | server | Brief description |

### Column Descriptions

- **Pattern**: Name of the pattern or paradigm
- **Category**: Type (creational, structural, behavioral, paradigm, other)
- **Paradigm**: Programming paradigm (fp, mixed)
- **Style**: Implementation style (functional, stateful)
- **Environment**: Target environment (server, client, both)
- **Use Case**: Brief description of the primary use case

## Configuration

Create a `generate-readme.config.json` file:

```json
{
  "patterns": [
    "src/patterns/**/*.ts",
    "src/paradigms/**/*.ts"
  ],
  "ignore": [
    "**/*.test.ts",
    "**/*.usage.ts",
    "**/index.ts"
  ],
  "output": "README.md",
  "categorize": {
    "patterns": {
      "creational": "/creational/",
      "structural": "/structural/",
      "behavioral": "/behavioral/"
    },
    "paradigms": "/paradigms/"
  },
  "tags": {
    "environment": ["server", "client", "both"],
    "style": ["stateful", "functional"],
    "paradigm": ["fp", "oop", "mixed"]
  }
}
```

## Development

```bash
bun run build
bun run test
```

## Available Scripts

- `dev`: bun run src/index.ts
- `build`: bun build src/index.ts --outdir dist
- `start`: bun run dist/index.js
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt
- `test`: vitest run

## License

MIT