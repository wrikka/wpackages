# @wpackages/bench

## Introduction

`@wpackages/bench` is a powerful, type-safe, and functional benchmarking utility for performance testing shell commands. It provides both a programmatic API and a command-line interface to easily run and compare the performance of different scripts or binaries, complete with detailed statistical analysis.

## Features

- 📊 **Detailed Statistics**: Calculates min, max, mean, median, variance, standard deviation, and percentiles for each benchmark.
- 🔁 **Command Comparison**: Easily compare the performance of multiple commands in a single run.
- parallel **Concurrency Testing**: Use the `--concurrency` flag to test how your commands perform under parallel execution.
- 📈 **Flexible Output**: Display results as a summary, a detailed table, or export them as JSON for further analysis.
- 🔧 **Lifecycle Hooks**: Define `prepare` and `cleanup` commands to run before and after each benchmark iteration.
- 🔒 **Type-Safe API**: Written in TypeScript to provide a fully type-safe programmatic interface.
- 🧩 **Functional by Design**: Built with functional programming principles for predictable and testable code.

## Goal

- 🎯 **Accurate Measurement**: To provide a reliable tool for accurately measuring and comparing the performance of command-line tools.
- 🧑‍💻 **Great DX**: To offer a simple and intuitive API, both programmatically and on the command line.
- 📊 **Insightful Analysis**: To equip developers with the statistical data needed to make informed performance decisions.

## Design Principles

- **Simplicity**: The API is designed to be straightforward and easy to use for common use cases.
- **Precision**: The core logic is carefully designed to provide accurate and reliable timing measurements.
- **Separation of Concerns**: The data collection, statistical calculation, and result rendering are handled as separate, pure functions.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Command-Line Interface

The `wbench` command is the easiest way to get started.

```bash
# Run a single benchmark
bun wbench "bun --version"

# Compare two commands
bun wbench "bun --version" "node --version"

# Customize runs and add a warmup phase
bun wbench --runs 100 --warmup 10 "my-script"

# Test scalability with 8 parallel invocations per run
bun wbench --runs 50 --concurrency 8 "my-script"

# Export results to a JSON file
bun wbench --export results.json "script1" "script2"
```

### Programmatic API

You can also use the `runBenchmark` function directly in your code.

```typescript
import { runBenchmark } from "@wpackages/bench";
import type { BenchmarkOptions } from "@wpackages/bench";

const options: Partial<BenchmarkOptions> = {
	runs: 50,
	warmup: 5,
};

// Benchmark a single command
const result = await runBenchmark(["echo 'hello'"], options);
console.log(`Mean execution time: ${result.mean.toFixed(2)} ms`);

// Compare multiple commands
const comparison = await runBenchmark(["sleep 0.1", "sleep 0.2"], { runs: 10 });
console.log(`The fastest command was: ${comparison.fastest}`);
```

## License

This project is licensed under the MIT License.
