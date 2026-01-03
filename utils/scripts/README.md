# scripts

A functional script management package for running and managing scripts, built with TypeScript and following functional programming principles.

## Features

- Functional error handling with Effect-TS
- Script configuration management with config-manager
- Dependency-aware script execution
- Parallel and sequential script execution
- CLI interface for script management
- Type-safe configuration with runtime validation
- **Advanced Features:**
  - Timeout support for long-running scripts
  - Automatic retry mechanism with configurable delays
  - Dry-run mode for testing script execution
  - Continue-on-error option for resilient pipelines
  - Script hooks (before/after execution)
  - Environment variable validation

## Installation

```bash
bun add scripts
```

## Usage

### CLI Usage

```bash
# List all available scripts
scripts list

# Run a specific script
scripts run build

# Run all scripts
scripts run-all

# Run all scripts in parallel
scripts run-all --parallel

# Show help
scripts help
```

### Programmatic Usage

```typescript
import { Effect } from "functional";
import { ScriptRunnerService } from "scripts/services";

// Run a script by name
const program = Effect.gen(function*() {
	const scriptRunner = yield* ScriptRunnerService;
	const result = yield* scriptRunner.runScriptByName("build");
	console.log("Script result:", result);
});

// Run multiple scripts
const program2 = Effect.gen(function*() {
	const scriptRunner = yield* ScriptRunnerService;
	const scripts = yield* scriptRunner.listScripts();
	const results = yield* scriptRunner.runScripts(scripts);
	console.log("Script results:", results);
});
```

### Configuration

Create a `scripts.config.ts` file in your project root:

```typescript
import { defineConfig } from "scripts/config";

export default defineConfig({
	scripts: {
		build: {
			name: "build",
			description: "Build the project",
			command: "bun run build",
			cwd: "./src",
			timeout: 10000,
		},
		test: {
			name: "test",
			description: "Run tests",
			command: "bun run test",
			dependencies: ["build"],
			timeout: 30000,
			retries: 2,
			retryDelay: 1000,
		},
		deploy: {
			name: "deploy",
			description: "Deploy the application",
			command: "bun run deploy",
			dependencies: ["test"],
			timeout: 60000,
			retries: 3,
			retryDelay: 2000,
			continueOnError: false,
		},
	},
	parallel: false,
});
```

### Advanced Configuration

#### Timeout Support

Set a maximum execution time for scripts:

```typescript
{
  name: 'build',
  command: 'bun run build',
  timeout: 10000  // 10 seconds
}
```

#### Retry Mechanism

Automatically retry failed scripts:

```typescript
{
  name: 'deploy',
  command: 'bun run deploy',
  retries: 3,           // Number of retry attempts
  retryDelay: 2000      // Delay between retries in ms
}
```

#### Dry-Run Mode

Test script execution without actually running commands:

```typescript
{
  name: 'deploy',
  command: 'bun run deploy',
  dryRun: true  // Simulates execution
}
```

#### Continue on Error

Allow pipeline to continue even if a script fails:

```typescript
{
  name: 'cleanup',
  command: 'bun run cleanup',
  continueOnError: true  // Pipeline continues on failure
}
```

## API

### Types

- `Script` - Script configuration interface
- `ScriptResult` - Script execution result interface
- `ScriptRunnerConfig` - Script runner configuration interface

### Services

- `ScriptRunnerService` - Main service for script execution
- `runScript` - Run a single script
- `runScripts` - Run multiple scripts
- `runScriptByName` - Run a script by name
- `listScripts` - List all available scripts

### Components

- `renderScriptInfo` - Render script information for CLI
- `renderScriptResults` - Render script results for CLI
- `renderScriptList` - Render script list for CLI
- `renderHelp` - Render help information for CLI

### Utilities

- `isValidScript` - Validate script configuration
- `formatScriptResult` - Format script result for display
- `sortScriptsByDependencies` - Sort scripts by dependencies
- `filterScriptsByName` - Filter scripts by name pattern

### Advanced Services

- `executeScriptWithTimeout` - Execute script with timeout support
- `executeScriptWithRetry` - Execute script with automatic retry
- `dryRunScript` - Simulate script execution
- `validateAdvancedScriptConfig` - Validate advanced script options
- `formatScriptExecutionInfo` - Format detailed script information

## Examples

See the `src/examples/` directory for complete usage examples:

- `basic-usage.example.ts` - Basic script execution
- `config.example.ts` - Configuration management

And usage files for detailed API examples:

- `src/utils/script-utils.usage.ts` - Utility functions
- `src/components/cli.usage.ts` - CLI components
- `src/services/advanced-script-runner.usage.ts` - Advanced features

## License

MIT
