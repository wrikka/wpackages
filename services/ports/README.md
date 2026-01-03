# @wpackages/ports

## Introduction

`@wpackages/ports` is a utility service for managing and checking the availability of network ports. It provides a simple API to find open ports, register their usage, and query their status, which is essential for orchestrating multiple development servers and services without port conflicts.

## Features

- 🔍 **Find Available Ports**: Automatically scan and find an open port, starting from a specified port number.
-
  - **Port Registry**: Register and unregister ports to keep track of which services are running where.
-
  - **Status Checking**: Programmatically check if a specific port is currently open or available.
-
  - **Zero Dependencies**: A lightweight, pure TypeScript utility with no external dependencies.

## Goal

- 🎯 **Prevent Port Conflicts**: To provide a programmatic way to avoid port conflicts in a local development environment, especially when running multiple services.
-
  - **Simplify Service Orchestration**: To make it easier for scripts and development tools to dynamically assign ports to services.

## Design Principles

- **Simplicity**: Provides a small, focused API for a single, well-defined problem.
- **Stateful Service**: The `PortService` instance maintains the state of registered ports for the lifetime of the process.
- **Reliability**: Uses standard networking APIs to reliably check port availability.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Create an instance of the `PortService` and use its methods to find and manage ports.

### Example: Finding and Registering a Port

```typescript
import { createPortService } from "@wpackages/ports";

async function main() {
	const portService = createPortService();

	// Find the next available port starting from 3000
	const availablePort = await portService.findAvailablePort(3000);

	if (availablePort) {
		console.log(`Found available port: ${availablePort}`);

		// Register the port as in-use
		const portInfo = portService.registerPort(availablePort, "my-service");
		console.log(`Registered ${portInfo.name} at ${portInfo.url}`);

		// Check if the port is now considered open/registered
		console.log(
			`Is port ${availablePort} open?`,
			portService.isPortOpen(availablePort),
		); // true
	} else {
		console.log("No available ports found.");
	}
}

main();
```

## License

This project is licensed under the MIT License.
