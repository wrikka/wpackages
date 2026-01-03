# @wpackages/api-builder

## Introduction

A powerful and lightweight library for building robust, type-safe, and scalable APIs in TypeScript. It is built on top of Effect-TS, leveraging functional programming principles to provide a declarative and composable way to define your API endpoints and business logic.

## Features

- ✨ **Declarative API:** Define your APIs in a clear and concise way.
- 🔒 **End-to-end Type Safety:** Catch errors at compile time, not runtime.
- 🚀 **Scalable & Performant:** Built to handle complex, high-performance applications.
- 🧩 **Composable & Modular:** Easily reuse and compose different parts of your API.
- 🎯 **Integrated Error Handling:** Manage errors gracefully with the power of Effect-TS.

## Goal

- 🎯 To simplify the process of building complex and reliable back-end services.
- 🛡️ To provide a highly maintainable and testable architecture for server-side applications.
- 🧑‍💻 To enhance developer experience by leveraging modern TypeScript features and functional programming concepts.

## Design Principles

- **Functional Core:** We embrace functional programming to write predictable and side-effect-free code.
- **Effect-driven:** All side effects (e.g., database queries, HTTP requests) are managed through the Effect-TS system.
- **Modularity:** Encourages breaking down logic into smaller, independent, and reusable modules.
- **Type Safety First:** We prioritize strong static typing to build resilient applications.

## Installation

```bash
bun add @wpackages/api-builder
```

## Usage

Here's a complete example of how to define an API on the server and call it from the client.

### Server-side (`server.ts`)

```typescript
import * as Schema from "@effect/schema/Schema";
import { builder, createServer } from "@wpackages/api-builder";
import { Effect } from "effect";

// 1. Define your data schemas
const User = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
});

// 2. Build your API definition
export const api = builder()
	.post("getUser", "/user", { // The key 'getUser' is used for the client
		schema: {
			response: User,
		},
		handler: () => Effect.succeed({ id: 1, name: "John Doe" }),
	})
	.build();

// 3. Export the API type for end-to-end type safety
export type ApiType = typeof api;

// 4. Create and start the server
createServer(api);
console.log("Server running at http://localhost:3000");
```

### Client-side (`client.ts`)

```typescript
import { createClient } from "@wpackages/api-builder";
// Import the API definition and type from the server code
import { api, ApiType } from "./server";

// 1. Create a type-safe client
const client = createClient<ApiType>("http://localhost:3000", api);

async function main() {
	try {
		// 2. Make a type-safe API call
		const user = await client.getUser(undefined); // No body is needed
		console.log("Fetched user:", user); // -> { id: 1, name: 'John Doe' }

		// The following would be a TypeScript error:
		// const wrong = await client.getUsers(undefined);
	} catch (error) {
		console.error("API call failed:", error);
	}
}

main();
```

## License

This project is licensed under the MIT License.
