# @wpackages/git

## Introduction

`@wpackages/git` is a functional, type-safe, and composable service for interacting with Git repositories. It provides an `Effect-TS`-based wrapper around the `git` command-line tool, transforming Git operations from side effects into declarative, testable `Effect`s.

## Features

- ⚡ **Effect-Based API**: All Git operations (getting status, current branch, commits, etc.) are exposed as `Effect`s.
- 💪 **Robust Error Handling**: Git command errors are captured as typed `Effect` failures, enabling exhaustive error handling.
- 🧪 **Highly Testable**: By modeling Git as a service, you can easily provide a mock implementation in your tests to simulate Git operations without needing a real repository.
- 🧩 **Composable**: Git effects can be seamlessly composed with other effects in your application.

## Goal

- 🎯 **Safe Side Effects**: To provide a safe and controlled interface for the side effect of interacting with a Git repository.
- ✅ **Enable Testability**: To allow application logic that depends on Git to be tested easily and reliably.
- 🧑‍💻 **Consistent Functional Interface**: To offer a consistent, functional API for all Git interactions, aligned with the rest of the `Effect-TS` ecosystem.

## Design Principles

- **Service-Oriented**: Git access is modeled as a service that can be provided via a `Layer`.
- **Declarative**: You describe the Git operation you want to perform as an effect; the service's implementation handles the actual interaction with the `git` CLI.
- **Structured Output**: The output of Git commands is parsed into structured, type-safe data, not just raw strings.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The service provides `Effect`s for common Git operations.

### Example: Getting the Current Branch

```typescript
import { Git } from "@wpackages/git";
import { Effect } from "effect";

// 1. Define a program that uses the Git service
const program = Effect.gen(function*() {
	// Access the service from the context
	const git = yield* Git;

	const isRepo = yield* git.isGitRepository(".");

	if (isRepo) {
		const branch = yield* git.getCurrentBranch(".");
		console.log("Current branch is:", branch);
	}
});

// 2. To run this, you would provide the live implementation of the Git service.
// const runnable = Effect.provide(program, GitLive);
// Effect.runPromise(runnable);
```

## License

This project is licensed under the MIT License.
