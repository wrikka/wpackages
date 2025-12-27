# bench

A powerful, type-safe, and functional benchmarking utility for performance testing your shell commands.

## Features

- **Simple API**: Run single benchmarks or compare multiple commands with ease.
- **Functional Approach**: Designed with pure functions and clear separation of concerns.
- **Type-Safe**: Written in TypeScript to catch errors at compile time.
- **Detailed Statistics**: Get min, max, mean, median, variance, standard deviation, and percentiles.
- **Flexible Output**: Display results as a summary, table, chart, or JSON.
- **Zero Dependencies**: Core logic has zero production dependencies.

## Installation

```bash
bun add bench
```

## Usage

`bench` can be used both programmatically in your code and as a command-line tool.

### Programmatic Usage

Here's how you can run a benchmark on a single command:

```typescript
import { runBenchmark } from 'bench';
import type { BenchmarkOptions } from 'bench';

const options: Partial<BenchmarkOptions> = {
  runs: 50,
  warmup: 5,
  // shell: 'bash', // Optional: specify the shell to use
};

const result = await runBenchmark(['echo "hello"'], options);

console.log(`Mean execution time: ${result.mean.toFixed(2)} ms`);
```

To compare multiple commands:

```typescript
import { runBenchmark } from 'bench';

const commands = [
  'sleep 0.1',
  'sleep 0.2',
];

const comparison = await runBenchmark(commands, { runs: 10 });

console.log(`Fastest command: ${comparison.fastest}`);
console.log(`Slowest command: ${comparison.slowest}`);
```

### Command-Line Usage

This package provides a CLI for quick benchmarking.

```bash
# Run a single benchmark
bunx bench "bun --version"

# Compare two commands
bunx bench "bun --version" "node --version"

# Customize runs and warmup
bunx bench --runs 100 --warmup 10 "my-script"

# Export results to a JSON file
bunx bench --export results.json "script1" "script2"
```

## API

### `runBenchmark(commands, options)`

- `commands: string[]`: An array of shell commands to benchmark.
- `options?: Partial<BenchmarkOptions>`: Optional configuration object.

Returns a `Promise<BenchmarkResult>` if one command is provided, or a `Promise<ComparisonResult>` if multiple commands are provided.

### `BenchmarkOptions`

| Option    | Type      | Default | Description                                      |
| --------- | --------- | ------- | ------------------------------------------------ |
| `runs`      | `number`  | `10`    | Number of benchmark iterations.                  |
| `warmup`    | `number`  | `0`     | Number of warmup iterations (not measured).      |
| `prepare`   | `string`  | `''`    | Command to run before each iteration.            |
| `cleanup`   | `string`  | `''`    | Command to run after each iteration.             |
| `shell`     | `string`  | `'bash'`| The shell to use for running commands.           |
| `output`    | `'summary' \| 'table' \| 'chart' \| 'json'` | `'summary'` | The output format for comparisons. |
| `export`    | `string`  | `''`    | File path to export results as JSON.             |
| `silent`    | `boolean` | `false` | Suppress console output.                         |
| `verbose`   | `boolean` | `false` | Log the time of each individual run.             |

## Development

To contribute to this package, follow these steps:

```bash
# 1. Clone the repository and install dependencies
bun install

# 2. Run the development server (watches for changes)
bun run dev

# 3. Run tests
bun test

# 4. Run a full review (format, lint, test, build)
bun run review
```

## License

MIT
