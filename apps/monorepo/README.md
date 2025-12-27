# monorepo

![npm version](https://img.shields.io/npm/v/monorepo.svg) ![license](https://img.shields.io/npm/l/monorepo.svg)

A next-generation monorepo management tool built with Effect-TS, designed for performance, scalability, and a great developer experience.

## Why monorepo?

This tool aims to provide a more robust and type-safe alternative to existing monorepo tools like Turborepo and Nx, by embracing the principles of functional programming with Effect-TS.

- **Effect-TS Powered**: Leverages functional programming and structured concurrency for robust and maintainable code.
- **High Performance**: Built with performance in mind, using an efficient task scheduler and caching system.
- **Declarative Configuration**: Simple and declarative configuration for your monorepo workspaces.
- **Extensible**: Designed to be extensible with custom plugins and tasks.
- **Functional Programming**: Follows pure functional principles with separation of concerns.
- **Component-Based Rendering**: Pure components for consistent CLI output.
- **Utility Functions**: Helpful utilities for common tasks like formatting bytes and durations.

## Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your system.

### Installation

```bash
# Install the CLI globally
npm install -g monorepo
```

## Usage

The `wts-mono` CLI provides several commands to manage your monorepo.

### List Workspaces

To see all the packages in your monorepo:

```bash
wts-mono list
```

### Run Tasks

To run a script (e.g., `build`) in all packages that have it, in the correct topological order:

```bash
wts-mono run build
```

## Project Structure

The project follows a functional programming structure, organized as follows:

```
src/
├── app.ts         # Main application logic and command routing
├── components/    # Pure UI components for CLI output
├── config/        # Configuration files
├── constant/      # Constant values
├── examples/      # Usage examples
├── index.ts       # Main entry point
├── lib/           # Third-party library wrappers
├── services/      # Business logic and side effects (Effect-TS)
├── types/         # Shared types and schemas
└── utils/         # Pure utility functions
```

## Development

To work on this project locally:

1.  **Clone the repository**
2.  **Install dependencies**: `bun install`
3.  **Run in dev mode**: `bun run dev`
4.  **Run tests**: `bun run test`

This project is configured to work with Turborepo for efficient task running and caching.

## Usage as a Library

You can also use monorepo as a library in your own projects:

```typescript
import { 
  WorkspaceService, 
  WorkspaceServiceLive,
  runTasks,
  MonorepoComponents,
  formatBytes,
  formatDuration
} from 'monorepo';

// Use services
const workspaces = await WorkspaceService.pipe(
  Effect.flatMap(service => service.getWorkspaces(process.cwd())),
  Effect.provide(WorkspaceServiceLive)
);

// Use components
console.log(MonorepoComponents.successMessage('Task completed successfully'));

// Use utilities
console.log(formatBytes(1024)); // "1 KB"
console.log(formatDuration(5000)); // "5.00s"
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.