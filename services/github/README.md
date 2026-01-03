# @wpackages/github

## Introduction

`@wpackages/github` provides a functional, type-safe, and composable service for interacting with the GitHub API. It provides an `Effect-TS`-based wrapper around an API client (like `octokit`), transforming GitHub API requests from side effects into declarative, testable `Effect`s.

## Features

- ⚡ **Effect-Based API**: All GitHub API interactions (e.g., fetching repositories, creating issues) are exposed as `Effect`s.
- 💪 **Robust Error Handling**: API and network errors are captured as typed `Effect` failures, enabling exhaustive and predictable error handling.
- 🧪 **Highly Testable**: By modeling the GitHub API as a service, you can easily provide a mock implementation in your tests to simulate API calls without hitting the actual network.
- 🔒 **Schema-Validated**: (Likely uses Zod/Schema) All API responses are parsed and validated against schemas, ensuring the data is in the expected shape.

## Goal

- 🎯 **Safe API Interactions**: To provide a safe and controlled interface for the side effect of communicating with the GitHub API.
- ✅ **Enable Testability**: To allow application logic that depends on the GitHub API to be tested easily and reliably.
- 🧑‍💻 **Consistent Functional Interface**: To offer a consistent, functional API for all GitHub interactions, aligned with the rest of the `Effect-TS` ecosystem.

## Design Principles

- **Service-Oriented**: GitHub API access is modeled as a service (`GitHub`) that can be provided via a `Layer` (`GitHubLive`).
- **Declarative**: You describe the API call you want to make as an effect; the service's implementation handles the actual HTTP request, authentication, and error handling.
- **Structured Data**: API responses are parsed into structured, type-safe data models.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The service provides `Effect`s for common GitHub API operations. You will need to provide a GitHub token for authentication.

### Example: Fetching Repository Details

```typescript
import { GitHub, GitHubLive } from "@wpackages/github";
import { Effect, Layer } from "effect";

// 1. Define a program that uses the GitHub service
const program = Effect.gen(function*() {
	// Access the service from the context
	const github = yield* GitHub;

	// Fetch repository details
	const repoDetails = yield* github.getRepo({
		owner: "facebook",
		repo: "react",
	});

	console.log("Repository Name:", repoDetails.name);
	console.log("Stars:", repoDetails.stargazers_count);
});

// 2. Create a live layer, providing the necessary configuration (e.g., auth token)
const gitHubLive = GitHubLive.layer({ token: () => process.env.GITHUB_TOKEN! });

// 3. Provide the layer to the program and run it
const runnable = Effect.provide(program, gitHubLive);

Effect.runPromise(runnable);
```

## License

This project is licensed under the MIT License.
