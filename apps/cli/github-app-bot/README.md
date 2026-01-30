# @wpackages/github-app-bot

## Introduction

`@wpackages/github-app-bot` is a specialized bot built as a GitHub App. Its primary function is to automate the review of dependency and version changes in pull requests. It can analyze changes to `package.json` files, check for compliance with project policies, and optionally provide an AI-generated summary of the changes.

## Features

- 🤖 **Automated PR Reviews**: Automatically posts comments on pull requests that modify dependencies.
- 🔍 **Dependency Analysis**: Scans for new, updated, or removed dependencies.
- 🧠 **AI-Powered Summaries**: (Optional) Integrates with an AI service to provide a natural language summary of the dependency changes and their potential impact.
-
  - **Policy Enforcement**: Can be configured to check against a policy file (`policy.json`) to enforce versioning rules.
-
  - **`Effect-TS` Native**: Built with `Effect-TS` for a robust, testable, and resilient architecture.

## Goal

- 🎯 **Automate Tedious Reviews**: To automate the process of reviewing dependency updates, freeing up developer time.
- 🛡️ **Improve Repository Health**: To help maintain the health and security of the codebase by keeping a close eye on dependencies.
-
  - **Provide Clear Insights**: To offer clear, concise summaries of changes, making it easier to understand the impact of a pull request.

## Design Principles

- **Event-Driven**: The bot is designed to react to GitHub webhook events (e.g., `pull_request.opened`).
- **Service-Oriented**: Leverages the `@wpackages/github` service for all interactions with the GitHub API.
- **Functional Core**: The business logic is implemented using `Effect-TS` for a purely functional, composable, and testable codebase.

## Installation & Setup

This is an internal service and is not meant to be installed directly. To run it, you need to:

1. **Create a GitHub App**: Set up a new GitHub App and configure it with the necessary permissions (e.g., read access to code, write access to pull requests).
2. **Configure Environment**: Create a `.env` file based on the `.env.example` file and fill in the required credentials for your GitHub App (App ID, Private Key, Webhook Secret).
3. **Run the Bot**: Start the bot service. It will listen for webhook events from GitHub.

```bash
# From the monorepo root
bun install

# Start the bot
turbo dev --filter=@wpackages/github-app-bot
```

## Usage

Once the bot is running and installed on a repository, it will automatically listen for `pull_request` events. When a pull request is opened or updated, the bot will:

1. Check if any `package.json` files were modified.
2. Analyze the dependency changes.
3. (If configured) Generate an AI summary.
4. Post a comment on the pull request with its findings.

## License

This project is licensed under the MIT License.
