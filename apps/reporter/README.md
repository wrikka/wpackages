# @wpackages/reporter-devtool

## Introduction

`@wpackages/reporter-devtool` is a simple and lightweight reporting utility for formatting and displaying test reports. It provides functions to format test results in both human-readable text and JSON formats, making it easy to integrate with testing frameworks and CI/CD pipelines.

## Features

- 📊 **Text Report Formatting**: Beautiful, formatted text output for terminal display
- 📄 **JSON Report Generation**: Structured JSON output for programmatic consumption
- 🎨 **Clear Visual Output**: Well-formatted reports with clear success/failure indicators
- 🧪 **Test Report Interface**: Type-safe `TestReport` interface for test results
- ⚡ **Zero Dependencies**: Minimal footprint with no external dependencies
- 🔒 **Type-Safe**: Full TypeScript support with compile-time type checking

## Goal

- 🎯 **Simple Reporting**: To provide a straightforward way to format and display test reports
- 🧑‍💻 **Easy Integration**: To make it easy to integrate with any testing framework
- 📱 **Multiple Formats**: To support both human-readable and machine-readable output formats

## Design Principles

- **Simplicity**: Minimal API that does one thing well
- **Flexibility**: Support multiple output formats for different use cases
- **Type Safety**: Leverage TypeScript for compile-time guarantees

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Text Report Formatting

Format test results for terminal display:

```typescript
import { printReport } from "@wpackages/reporter-devtool";

const report = {
  suites: [],
  totalTests: 10,
  passedTests: 8,
  failedTests: 2,
  skippedTests: 0,
  duration: 1500,
  success: false,
};

printReport(report);
// Output:
// ============================================================
// TEST REPORT
// ============================================================
//
// Total Tests: 10
// Passed: 8
// Failed: 2
// Skipped: 0
// Duration: 1500ms
//
// ============================================================
// SOME TESTS FAILED
// ============================================================
```

### JSON Report Generation

Generate structured JSON output:

```typescript
import { generateJsonReport } from "@wpackages/reporter-devtool";

const report = {
  suites: [],
  totalTests: 10,
  passedTests: 10,
  failedTests: 0,
  skippedTests: 0,
  duration: 1200,
  success: true,
};

const jsonReport = generateJsonReport(report);
console.log(jsonReport);
// Output:
// {
//   "suites": [],
//   "totalTests": 10,
//   "passedTests": 10,
//   "failedTests": 0,
//   "skippedTests": 0,
//   "duration": 1200,
//   "success": true
// }
```

### Custom Report Formatting

Use the `TestReport` interface to create custom reports:

```typescript
import type { TestReport } from "@wpackages/reporter-devtool";
import { formatReport } from "@wpackages/reporter-devtool";

const customReport: TestReport = {
  suites: [
    { name: "Unit Tests", tests: 5 },
    { name: "Integration Tests", tests: 3 },
  ],
  totalTests: 8,
  passedTests: 7,
  failedTests: 1,
  skippedTests: 0,
  duration: 2000,
  success: false,
};

const formatted = formatReport(customReport);
console.log(formatted);
```

## API Reference

### `printReport(report: TestReport): void`

Prints a formatted test report to the console.

- `report`: The test report to display

### `formatReport(report: TestReport): string`

Returns a formatted test report as a string.

- `report`: The test report to format
- Returns: Formatted string representation

### `generateJsonReport(report: TestReport): string`

Returns a JSON string representation of the test report.

- `report`: The test report to serialize
- Returns: JSON string

### `TestReport` Interface

```typescript
interface TestReport {
  suites: readonly unknown[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  success: boolean;
}
```

## License

This project is licensed under the MIT License.
