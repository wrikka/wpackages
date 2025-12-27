# check

Comprehensive code quality checker with TypeScript, unused code detection, dependency analysis, and more - Built with Effect-TS.

## Features

- 🔍 **Type Checking** - Full TypeScript type checking
- 🧹 **Unused Code** - Detect unused variables, imports, and exports
- 📦 **Dependencies** - Check dependency versions and usage
- 🔗 **Imports** - Validate import paths and extensions
- ♻️ **Circular Dependencies** - Detect circular dependency chains
- 📊 **Complexity** - Measure code complexity
- 🎯 **Parallel Execution** - Run checks concurrently
- 🎨 **Beautiful Output** - Colorful, readable reports
- 📄 **Multiple Formats** - Text, table, or JSON output

## Installation

```bash
bun add -D check
```

## Usage

### CLI

```bash
# Run default checks (type, unused, deps)
wcheck

# Run all checks
wcheck --all

# Run specific checks
wcheck -t type -t unused

# Run with parallel execution
wcheck --all --parallel

# Output as JSON
wcheck --output json

# Output as table
wcheck --output table
```

### Programmatic

```typescript
import { runChecker } from 'check';
import { Effect } from 'effect';

const program = runChecker({
  types: ['type', 'unused', 'deps'],
  parallel: true,
  output: 'text',
});

await Effect.runPromise(program);
```

## Check Types

- **type** - TypeScript type checking via compiler API ✅
- **unused** - Find unused variables, imports, parameters ✅
- **deps** - Check package.json dependencies ✅
- **depsUpdate** - Check for outdated dependencies ✅ NEW
- **imports** - Validate import statements and paths ✅
- **circular** - Detect circular dependency chains ✅
- **complexity** - Measure cyclomatic complexity ✅
- **size** - Check file sizes ✅
- **duplicates** - Find duplicate code blocks ✅
- **security** - Security vulnerability checks ✅
- **typeSafe** - Check type safety settings ✅ NEW
- **sideEffect** - Detect side effects in code ✅ NEW

## Options

```typescript
interface CheckerOptions {
  types: CheckType[];           // Which checks to run
  include?: string[];           // Glob patterns to include
  exclude?: string[];           // Glob patterns to exclude
  fix?: boolean;                // Auto-fix issues
  parallel?: boolean;           // Run in parallel
  maxConcurrency?: number;      // Max parallel checks
  verbose?: boolean;            // Verbose output
  silent?: boolean;             // Silent mode
  output?: 'json' | 'text' | 'table';  // Output format
}
```

## Examples

### Basic Usage

```typescript
import { runChecker } from 'check';

// Run with defaults
await runChecker();

// Custom configuration
await runChecker({
  types: ['type', 'circular'],
  parallel: true,
  verbose: true,
});
```

### Integration with CI/CD

```json
{
  "scripts": {
    "check": "wcheck --all",
    "check:type": "wcheck -t type",
    "check:ci": "wcheck --all --output json"
  }
}
```

## License

MIT
