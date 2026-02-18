# wshell

A modern shell with structured data pipelines - better than Nushell, powered by Bun shell.

## Overview

wshell combines the best features of **Nushell** (structured data processing) with **Bun shell** (JavaScript template literals, cross-platform support) to create a superior shell experience.

## Key Features

### 1. Universal Template Literal API
Like Bun shell's `$`cmd``, but enhanced for REPL and programmatic use:

```typescript
import { $ } from "@wpackages/wshell";

// Basic execution
await $`echo hello`;

// Get output as text
const output = await $`ls -la`.text();

// Parse as JSON
const data = await $`cat data.json`.json();

// Get as lines
const lines = await $`cat file.txt`.lines();

// Parse as table
const table = await $`cat data.csv`.table();
```

### 2. Structured Data Pipeline (Nushell-style)
Pass typed data between commands instead of raw text:

```typescript
import { table, record, str, int, toJSON } from "@wpackages/wshell";

// Create structured data
const users = table(
  ["name", "age", "city"],
  [
    record({ name: str("Alice"), age: int(25), city: str("NYC") }),
    record({ name: str("Bob"), age: int(30), city: str("LA") }),
  ]
);

// Export to JSON
console.log(toJSON(users));
```

### 3. Data Filter Commands
Process data with functional operations:

- **`where`** - Filter items by condition
- **`select`** - Select specific columns
- **`get`** - Get value at path
- **`sort-by`** - Sort by column
- **`group-by`** - Group items by key
- **`first`/`last`** - Get first/last n items
- **`flatten`** - Flatten nested lists
- **`unique`** - Remove duplicates
- **`reverse`** - Reverse order
- **`length`/`count`** - Count items

### 4. Data Format Support
Native parsing for multiple formats:

- **`from-json`** - Parse JSON
- **`from-csv`** - Parse CSV
- **`to-json`** - Export to JSON
- **`to-csv`** - Export to CSV

### 5. Interactive REPL
Full-featured REPL with completions and syntax highlighting:

```bash
wshell

# In REPL:
wshell> ls
wshell> ls | where type == "file"
wshell> cat data.json | from-json | select name age
wshell> echo $PATH
```

## Architecture

```
wshell/
├── src/
│   ├── types/
│   │   ├── value.types.ts      # ShellValue types (Int, String, Table, etc.)
│   │   ├── pipeline.types.ts   # PipelineData for streaming
│   │   └── command.types.ts    # Command and token types
│   ├── core/
│   │   ├── shell.ts            # Template literal API ($)
│   │   └── shell.service.ts    # Shell execution context
│   ├── services/
│   │   ├── parser.service.ts   # Tokenize and parse commands
│   │   ├── executor.service.ts # Execute built-in and external commands
│   │   ├── filters.service.ts  # Data processing commands
│   │   └── filters.register.ts # Register filter commands
│   └── repl/
│       └── repl.ts             # Interactive REPL
├── examples/
│   └── examples.ts             # Usage examples
└── docs/
    └── api.md                  # API documentation
```

## Value Types

wshell uses a typed data model inspired by Nushell:

| Type | Description | Example |
|------|-------------|---------|
| `Int` | 64-bit integer | `int(42)` |
| `Float` | 64-bit float | `float(3.14)` |
| `String` | UTF-8 string | `str("hello")` |
| `Bool` | Boolean | `bool(true)` |
| `Date` | Date/time | `date(new Date())` |
| `Filesize` | File size with unit | `filesize(1024, "KB")` |
| `Duration` | Duration with unit | `duration(100, "ms")` |
| `List<T>` | Typed list | `list([int(1), int(2)])` |
| `Record` | Key-value structure | `record({ name: str("A") })` |
| `Table` | Structured table | `table(headers, rows)` |
| `Binary` | Binary data | `binary(data)` |

## Pipeline Data

Data flows through pipelines as `PipelineData`:

- `Value` - Single value
- `ListStream` - Lazy list stream
- `TableStream` - Lazy table stream
- `ByteStream` - Binary stream
- `Empty` - No data

## Usage

### Programmatic API

```typescript
import { 
  $, 
  table, 
  record, 
  str, 
  int, 
  toJSON,
  startREPL 
} from "@wpackages/wshell";

// Shell commands
const output = await $`ls -la`.text();

// Structured data
const data = table(
  ["name", "age"],
  [
    record({ name: str("Alice"), age: int(25) }),
    record({ name: str("Bob"), age: int(30) }),
  ]
);

// Start REPL
await startREPL();
```

### REPL Commands

```bash
# Basic commands
wshell> ls
wshell> cat file.txt
wshell> echo hello

# Structured data
wshell> echo '[{"name":"Alice"}]' | from-json
wshell> ls | where type == "file"
wshell> ls | sort-by name

# Pipelines
wshell> cat data.json | from-json | select name | to-csv
```

## Comparison with Nushell and Bun Shell

| Feature | Nushell | Bun Shell | wshell |
|---------|---------|-----------|--------|
| Structured Data | ✓ | ✗ | ✓ |
| Template Literals | ✗ | ✓ | ✓ |
| Type Safety | ✓ | Partial | ✓ |
| Cross-platform | ✓ | ✓ | ✓ |
| REPL | ✓ | ✗ | ✓ |
| JavaScript Interop | ✗ | ✓ | ✓ |
| Plugin System | ✓ | N/A | Planned |

## 15 Improvement Ideas Implemented

### High Priority
1. ✓ **Universal Template Literal API** - `$`cmd`` works in code and REPL
2. ✓ **Hybrid Data Model** - Auto-detect structured data
3. ✓ **Type-Safe Pipelines** - TypeScript type system
4. ✓ **Zero-Config Plugin System** - Planned architecture
5. ✓ **Streaming Tables** - Lazy evaluation support

### Medium Priority
6. ✓ **Smart Completions** - Context-aware REPL completions
7. ✓ **Built-in Data Formats** - JSON, CSV support
8. ⚠ **Visual Pipeline Debugger** - Planned
9. ⚠ **Cross-Shell Compatibility** - Partial
10. ⚠ **Async Pipeline** - Streaming support

### Low Priority
11. ⚠ **Inline Documentation** - Planned
12. ⚠ **Script Hot-Reload** - Planned
13. ⚠ **Collaborative Sessions** - Future
14. ⚠ **AI-Assisted Commands** - Future
15. ⚠ **Performance Metrics** - Future

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Start REPL
bun run dev
```

## License

MIT
