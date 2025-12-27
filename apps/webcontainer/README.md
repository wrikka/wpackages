# webcontainer

A comprehensive WebContainer management service for creating isolated development environments in the browser or Node.js.

## Installation

```bash
bun add webcontainer
```

## Features

- 🐳 **Container Management** - Create, start, stop, and manage WebContainers
- 📁 **File System Operations** - Read, write, and manage files within containers
- 🚀 **Process Execution** - Run commands and manage processes in containers
- 🔌 **Port Management** - Handle port forwarding and server URLs
- 📦 **Package Management** - Install dependencies within containers
- 🔄 **State Management** - Track container lifecycle and state
- 🎯 **Type-safe** - Full TypeScript support with comprehensive types
- ⚡ **Service Architecture** - Clean separation of concerns with service layer

## Architecture

This package follows a layered architecture:

```
├── core/          # Core container operations
├── services/      # Service layer for business logic
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── config/        # Configuration management
├── validators/    # Input validation
└── mocks/         # Mock implementations for testing
```

## Quick Start

### Basic Container Usage

```typescript
import { createContainer } from 'webcontainer';

// Create a new container
const container = await createContainer({
  name: 'my-dev-environment',
  workdir: '/app',
});

// Start the container
await container.start();

// Execute a command
const result = await container.execute('echo', ['Hello World']);
console.log(result.stdout); // "Hello World"

// Stop the container
await container.stop();
```

### File System Operations

```typescript
import { createContainer } from 'webcontainer';

const container = await createContainer({ workdir: '/app' });
await container.start();

// Write a file
await container.writeFile('/app/index.js', 'console.log("Hello!")');

// Read a file
const content = await container.readFile('/app/index.js');
console.log(content);

// List directory contents
const files = await container.listFiles('/app');
console.log(files);
```

### Installing Dependencies

```typescript
import { createContainer } from 'webcontainer';

const container = await createContainer({ workdir: '/app' });
await container.start();

// Create package.json
await container.writeFile('/app/package.json', JSON.stringify({
  name: 'my-app',
  dependencies: { 'is-odd': '^3.0.1' }
}));

// Install dependencies
await container.installDependencies();
```

### Port Management

```typescript
import { createContainer } from 'webcontainer';

const container = await createContainer({ workdir: '/app' });
await container.start();

// Get server URL for a port
const url = await container.getServerUrl(3000);
console.log(`Server running at: ${url}`);
```

## Core API

### Container Creation

#### `createContainer(config)`

Creates a new container instance.

```typescript
import { createContainer } from 'webcontainer';

const container = await createContainer({
  name: 'my-container',
  workdir: '/app',
  env: {
    NODE_ENV: 'development',
  },
});
```

### Container Methods

#### `container.start()`

Starts the container.

```typescript
await container.start();
```

#### `container.stop()`

Stops the container.

```typescript
await container.stop();
```

#### `container.execute(command, args, options?)`

Executes a command in the container.

```typescript
const result = await container.execute('node', ['--version']);
console.log(result.stdout);
```

#### `container.spawn(command, args, options?)`

Spawns a long-running process.

```typescript
const process = await container.spawn('npm', ['run', 'dev']);

process.output.on('data', (data) => {
  console.log(data);
});
```

### File System Methods

#### `container.writeFile(path, content)`

Writes content to a file.

```typescript
await container.writeFile('/app/index.js', 'console.log("Hello!")');
```

#### `container.readFile(path)`

Reads content from a file.

```typescript
const content = await container.readFile('/app/index.js');
```

#### `container.listFiles(path)`

Lists files in a directory.

```typescript
const files = await container.listFiles('/app');
```

#### `container.deleteFile(path)`

Deletes a file.

```typescript
await container.deleteFile('/app/temp.txt');
```

### Package Management

#### `container.installDependencies()`

Installs dependencies from package.json.

```typescript
await container.installDependencies();
```

### Port Management

#### `container.getServerUrl(port)`

Gets the URL for a server running on a specific port.

```typescript
const url = await container.getServerUrl(3000);
```

### Container Info

#### `container.getInfo()`

Returns container information.

```typescript
const info = container.getInfo();
console.log(info.name, info.status, info.workdir);
```

## Service Layer

The package includes a service layer for more complex operations:

```typescript
import { WebContainerService } from 'webcontainer';

const service = new WebContainerService();

const container = await service.createContainer({
  name: 'my-container',
  workdir: '/app',
});
```

## Type Definitions

The package provides comprehensive TypeScript types:

```typescript
import type {
  ContainerConfig,
  ContainerStatus,
  ExecutionResult,
  FileNode,
  ProcessInfo,
  PortInfo,
} from 'webcontainer';
```

## Advanced Usage

### Container Manager

Manage multiple containers:

```typescript
import { createContainerManager } from 'webcontainer';

const manager = createContainerManager();

// Create multiple containers
const container1 = await manager.create({ name: 'container-1' });
const container2 = await manager.create({ name: 'container-2' });

// List all containers
const containers = manager.list();

// Get specific container
const container = manager.get('container-1');

// Remove container
await manager.remove('container-1');
```

### Custom Configuration

```typescript
import { createContainer } from 'webcontainer';

const container = await createContainer({
  name: 'custom-container',
  workdir: '/workspace',
  env: {
    NODE_ENV: 'production',
    API_KEY: 'secret',
  },
  timeout: 30000,
});
```

### Error Handling

```typescript
import { createContainer, ContainerError } from 'webcontainer';

try {
  const container = await createContainer({ workdir: '/app' });
  await container.start();
  await container.execute('invalid-command', []);
} catch (error) {
  if (error instanceof ContainerError) {
    console.error(`Container error: ${error.message}`);
  }
}
```

## Examples

Check the `examples/` directory for more detailed examples:

- `basic-usage.ts` - Basic container operations
- `nuxt-example.ts` - Running a Nuxt.js app in a container
- `usage.ts` - Comprehensive usage examples

## Development

### Available Scripts

- `bun run build` - Build the package
- `bun run dev` - Watch mode for development
- `bun run format` - Format code with Biome
- `bun run lint` - Lint and type-check code
- `bun run review` - Format, lint, and test
- `bun run test` - Run tests with Vitest

### Testing

```bash
bun test
```

### Building

```bash
bun run build
```

## Dependencies

This package depends on:

- `terminal` - For command execution
- `package-manager` - For package management

## License

Part of WTS framework monorepo.
