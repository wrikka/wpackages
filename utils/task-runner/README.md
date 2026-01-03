# runner

Advanced command runner with functional programming patterns - better than execa.

## Features

- 🚀 **Type-safe API** - Full TypeScript support with comprehensive types
- 🔄 **Functional Programming** - Result<T, E> pattern for error handling
- 🔁 **Retry Logic** - Built-in retry with exponential backoff
- 🔗 **Command Piping** - Chain commands together (cmd1 | cmd2)
- ⏱️ **Timeout & Cancellation** - AbortController support
- 📊 **Streaming Output** - Real-time stdout/stderr handling
- 🎯 **Cross-platform** - Works on Windows, macOS, and Linux
- 🧪 **Fully Tested** - Comprehensive test coverage
- 📦 **Zero Dependencies** - Minimal footprint
- 🔧 **DX Focused** - Great developer experience with helpful utilities
- 🏗️ **Builder Pattern** - Fluent API for building commands
- 📝 **Template Literals** - Tagged templates for command construction

## Installation

```bash
bun add runner
```

## Quick Start

```typescript
import { execute, isOk } from "runner";

// Basic execution
const result = await execute({
	command: "echo",
	args: ["Hello, World!"],
});

if (isOk(result)) {
	console.log(result.value.stdout); // "Hello, World!"
} else {
	console.error(result.error.message);
}
```

## Usage

### Basic Execution

```typescript
import { execute } from "runner";

// Simple command
const result = await execute({
	command: "git",
	args: ["status"],
});

// With options
const result = await execute({
	command: "npm",
	args: ["install"],
	cwd: "/project",
	timeout: 30000,
	env: { NODE_ENV: "production" },
});
```

### Result Pattern

```typescript
import { execute, isOk, unwrap, unwrapOr } from "runner";

const result = await execute({ command: "echo", args: ["test"] });

// Check success
if (isOk(result)) {
	console.log(result.value.stdout);
}

// Unwrap (throws on error)
const value = unwrap(result);

// Unwrap with default
const value = unwrapOr(result, { stdout: "default" });
```

### Streaming Output

```typescript
import { executeStream } from "runner";

const result = await executeStream(
	{ command: "npm", args: ["install"] },
	{
		onStdout: (chunk) => console.log("OUT:", chunk),
		onStderr: (chunk) => console.error("ERR:", chunk),
		onOutput: (chunk) => console.log("ALL:", chunk),
	},
);
```

### Retry Logic

```typescript
import { executeWithRetry, retryOnNetworkError, retryOnTimeout } from "runner";

// Basic retry
const result = await executeWithRetry(
	{ command: "curl", args: ["https://api.example.com"] },
	{
		retries: 3,
		retryDelay: 1000,
		backoffFactor: 2, // Exponential backoff
	},
);

// Conditional retry
const result = await executeWithRetry(
	{ command: "git", args: ["push"] },
	{
		retries: 5,
		shouldRetry: retryOnNetworkError,
		onRetry: (error, attempt) => {
			console.log(`Retry ${attempt + 1}: ${error.message}`);
		},
	},
);
```

### Command Piping

```typescript
import { executePipe } from "runner";

// Pipe commands together
const result = await executePipe({
	commands: [
		{ command: "cat", args: ["file.txt"] },
		{ command: "grep", args: ["pattern"] },
		{ command: "wc", args: ["-l"] },
	],
});

// With options
const result = await executePipe({
	commands: [
		{ command: "git", args: ["log"] },
		{ command: "grep", args: ["fix:"] },
	],
	timeout: 10000,
	failFast: true,
});
```

### Timeout & Cancellation

```typescript
import { execute } from "runner";

// With timeout
const result = await execute({
	command: "long-running-task",
	timeout: 5000, // 5 seconds
});

// With AbortController
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

const result = await execute({
	command: "task",
	signal: controller.signal,
});
```

### Dry Run Mode

```typescript
import { execute } from "runner";

// Don't actually execute, just log
const result = await execute({
	command: "rm",
	args: ["-rf", "/"],
	dryRun: true, // Safe!
});
```

### Synchronous Execution

```typescript
import { executeSync } from "runner";

// For simple cases that need to block
const result = executeSync({
	command: "git",
	args: ["rev-parse", "HEAD"],
});
```

### Builder Pattern

```typescript
import { command, docker, git, npm } from "runner";

// Fluent API for building commands
const result = await npm("install")
	.cwd("/project")
	.env({ NODE_ENV: "production" })
	.timeout(30000)
	.verbose()
	.run();

// Git commands
await git("status").args("--short").run();
await git("commit").args("-m", "Initial commit").run();

// Docker commands
await docker("run")
	.args("-p", "3000:3000")
	.args("-d", "nginx")
	.run();

// Clone and modify
const baseCmd = command("npm").cwd("/project");
const install = baseCmd.clone().args("install");
const test = baseCmd.clone().args("test");
```

### Template Literals

```typescript
import { bash, cmd, createTemplate, ps, sh } from "runner";

// Simple template
const name = "world";
const result = await execute(cmd`echo hello ${name}`);

// Shell command
await execute(sh`ls -la | grep node`);

// Bash command (Unix)
await execute(bash`echo $HOME`);

// PowerShell command (Windows)
await execute(ps`Get-Process node`);

// Reusable template
const gitCommit = createTemplate("git commit -m {message}");
const commit1 = gitCommit({ message: "feat: add feature" });
const commit2 = gitCommit({ message: "fix: resolve bug" });
```

## API

### Types

#### `RunnerOptions`

```typescript
interface RunnerOptions {
	command: string;
	args?: readonly string[];
	cwd?: string;
	env?: Record<string, string>;
	timeout?: number;
	signal?: AbortSignal;
	shell?: boolean | string;
	input?: string | Buffer | Uint8Array;
	encoding?: BufferEncoding;
	killSignal?: NodeJS.Signals;
	maxBuffer?: number;
	stdout?: boolean | "pipe" | "ignore" | "inherit";
	stderr?: boolean | "pipe" | "ignore" | "inherit";
	stdin?: boolean | "pipe" | "ignore" | "inherit";
	verbose?: boolean;
	dryRun?: boolean;
	stripFinalNewline?: boolean;
	preferLocal?: boolean;
	rejectOnError?: boolean;
}
```

#### `RunnerResult`

```typescript
interface RunnerResult {
	command: string;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	output: string;
	success: boolean;
	signal: NodeJS.Signals | null;
	duration: number;
	killed: boolean;
	timedOut: boolean;
}
```

#### `Result<T, E>`

```typescript
type Result<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };
```

### Functions

#### `execute(options: RunnerOptions): Promise<Result<RunnerResult, RunnerError>>`

Execute a command asynchronously.

#### `executeStream(options: RunnerOptions, handler: StreamHandler): Promise<Result<RunnerResult, RunnerError>>`

Execute a command with streaming output.

#### `executeSync(options: RunnerOptions): Result<RunnerResult, RunnerError>`

Execute a command synchronously.

#### `executeWithRetry(options: RunnerOptions, retryOptions: RetryOptions): Promise<Result<RunnerResult, RunnerError>>`

Execute a command with retry logic.

#### `executePipe(options: PipeOptions): Promise<Result<RunnerResult, RunnerError>>`

Execute commands in a pipe chain.

### Utilities

- `isOk(result)` - Check if result is successful
- `isErr(result)` - Check if result is failed
- `unwrap(result)` - Get value or throw error
- `unwrapOr(result, defaultValue)` - Get value or default
- `map(result, fn)` - Transform successful result
- `mapErr(result, fn)` - Transform error result
- `chain(result, fn)` - Chain operations

### Retry Predicates

- `retryOnTimeout` - Retry on timeout errors
- `retryOnExitCodes([1, 2])` - Retry on specific exit codes
- `retryOnNetworkError` - Retry on network errors
- `retryAll(...predicates)` - Combine predicates with AND
- `retryAny(...predicates)` - Combine predicates with OR
- `retryUntil(maxAttempts)` - Retry until max attempts

## Examples

See the [examples](./src/utils/*.usage.ts) directory for more usage examples.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Build
bun run build

# Run in dev mode
bun run dev

# Format code
bun run format

# Lint code
bun run lint

# Run all checks
bun run review
```

## Why Better Than Execa?

- ✅ **Functional error handling** - Result<T, E> pattern instead of try/catch
- ✅ **Built-in retry logic** - No need for external libraries
- ✅ **Type-safe piping** - Full TypeScript support for pipes
- ✅ **Composable utilities** - Functional programming patterns
- ✅ **Better DX** - More intuitive API with Builder Pattern
- ✅ **Template literals** - Tagged templates for easy command construction
- ✅ **Zero dependencies** - Smaller bundle size
- ✅ **Dry run mode** - Safe command testing
- ✅ **Better timeout handling** - More control over cancellation
- ✅ **Command builder** - Fluent API for complex commands

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT
