# @wpackages/git

## Introduction

`@wpackages/git` is a functional, type-safe, and composable service for interacting with Git repositories. It provides an `Effect-TS`-based wrapper around the `git` command-line tool, transforming Git operations from side effects into declarative, testable `Effect`s.

## Features

- ⚡ **Effect-Based API**: All Git operations (getting status, current branch, commits, etc.) are exposed as `Effect`s.
- 💪 **Robust Error Handling**: Git command errors are captured as typed `Effect` failures, enabling exhaustive error handling.
- 🧪 **Highly Testable**: By modeling Git as a service, you can easily provide a mock implementation in your tests to simulate Git operations without needing a real repository.
- 🧩 **Composable**: Git effects can be seamlessly composed with other effects in your application.
- 📦 **Comprehensive Git Operations**: Support for 40+ Git operations including init, stash, merge, rebase, tags, remotes, and more.

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

### Creating a Git Repository Instance

```typescript
import { createGitRepository } from "@wpackages/git";

const git = createGitRepository("/path/to/repo");
```

### Basic Operations

#### Initialize a Repository

```typescript
import { Effect } from "effect";
import { createGitRepository } from "@wpackages/git";

const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/new/repo");
	yield* git.init();
});
```

#### Check Repository Status

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const status = yield* git.status();
	console.log("Branch:", status.branch);
	console.log("Modified files:", status.modified);
});
```

#### Get Current Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const branch = yield* git.getCurrentBranch();
	console.log("Current branch:", branch);
});
```

#### Commit Changes

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.add(["file1.ts", "file2.ts"]);
	const commitHash = yield* git.commit("Add new features", "Detailed description");
	console.log("Committed:", commitHash);
});
```

### Branch Operations

#### Create and Switch Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.checkout("feature-branch", true); // Create and switch
});
```

#### Rename Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.renameBranch("old-name", "new-name");
});
```

#### List Branches

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const branches = yield* git.branch();
	console.log("Branches:", branches);
});
```

#### Delete Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.deleteBranch("feature-branch");
});
```

### Stash Operations

#### Create Stash

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.stash("Work in progress", true); // Include untracked files
});
```

#### List Stashes

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const stashes = yield* git.stashList();
	console.log("Stashes:", stashes);
});
```

#### Apply Stash

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.stashApply(0); // Apply stash at index 0
});
```

#### Pop Stash

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.stashPop(0); // Pop stash at index 0
});
```

#### Drop Stash

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.stashDrop(0); // Drop stash at index 0
});
```

#### Clear All Stashes

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.stashClear();
});
```

### Merge Operations

#### Merge Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.merge("feature-branch");
});
```

#### Merge Without Fast-Forward

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.merge("feature-branch", true); // --no-ff
});
```

### Rebase Operations

#### Rebase Branch

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.rebase("main");
});
```

#### Interactive Rebase

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.rebase("main", true); // Interactive rebase
});
```

### Cherry-Pick and Revert

#### Cherry-Pick Commit

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.cherryPick("abc123def456");
});
```

#### Revert Commit

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.revert("abc123def456");
});
```

### Tag Operations

#### Create Tag

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.tag("v1.0.0", "Release version 1.0.0");
});
```

#### Create Tag on Specific Commit

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.tag("v1.0.0", "Release version 1.0.0", "abc123def456");
});
```

#### List Tags

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const tags = yield* git.listTags();
	console.log("Tags:", tags);
});
```

#### Delete Tag

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.deleteTag("v1.0.0");
});
```

### Remote Operations

#### Add Remote

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.addRemote("origin", "https://github.com/user/repo.git");
});
```

#### Remove Remote

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.removeRemote("origin");
});
```

#### Rename Remote

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.renameRemote("origin", "upstream");
});
```

#### List Remotes

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const remotes = yield* git.remote();
	console.log("Remotes:", remotes);
});
```

### Config Operations

#### Get Config Value

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const userName = yield* git.getConfig("user.name");
	console.log("User name:", userName);
});
```

#### Set Config Value

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.setConfig("user.name", "John Doe");
});
```

#### Set Global Config Value

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.setConfig("user.email", "john@example.com", true); // Global
});
```

### Diff and Statistics

#### Get Diff Statistics

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const stats = yield* git.diffStat();
	console.log("Diff stats:", stats);
});
```

#### Get Diff Statistics Between Commits

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const stats = yield* git.diffStat("abc123", "def456");
	console.log("Diff stats:", stats);
});
```

### Clean Operations

#### Clean Untracked Files

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.clean();
});
```

#### Clean with Force

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.clean(true); // Force clean
});
```

#### Clean Files and Directories

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.clean(true, true); // Force clean, including directories
});
```

### Push and Pull

#### Push to Remote

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.push("origin", "main");
});
```

#### Pull from Remote

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.pull("origin", "main");
});
```

#### Pull with Rebase

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.pull("origin", "main", true); // Rebase
});
```

### Log and History

#### Get Commit Log

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const commits = yield* git.log(10); // Last 10 commits
	console.log("Commits:", commits);
});
```

#### Get Commit Details

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const commit = yield* git.show("abc123def456");
	console.log("Commit:", commit);
});
```

#### Get Reflog

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const reflog = yield* git.reflog(10); // Last 10 reflog entries
	console.log("Reflog:", reflog);
});
```

### Reset Operations

#### Soft Reset

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.reset("soft", "abc123def456");
});
```

#### Hard Reset

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	yield* git.reset("hard", "abc123def456");
});
```

### Blame

#### Get File Blame

```typescript
const program = Effect.gen(function*() {
	const git = createGitRepository("/path/to/repo");
	const blame = yield* git.blame("src/index.ts");
	console.log("Blame:", blame);
});
```

## API Reference

### GitRepository Interface

The `GitRepository` interface provides the following methods:

#### Repository Info
- `isGitRepository()` - Check if path is a git repository
- `getCurrentBranch()` - Get the current branch name

#### Basic Operations
- `init()` - Initialize a new git repository
- `clone(url, path?)` - Clone a repository
- `add(files)` - Stage files for commit
- `commit(message, body?)` - Create a commit
- `push(remote?, branch?, force?)` - Push changes to remote
- `pull(remote?, branch?, rebase?)` - Pull changes from remote
- `fetch(remote?, branch?)` - Fetch from remote

#### Status and History
- `status()` - Get repository status
- `log(limit?, branch?)` - Get commit log
- `show(hash)` - Get commit details
- `reflog(limit?)` - Get reflog entries

#### Branch Operations
- `branch(name?)` - List or create branches
- `deleteBranch(name, force?)` - Delete a branch
- `renameBranch(oldName, newName)` - Rename a branch
- `checkout(branch, create?)` - Switch or create branch

#### Advanced Operations
- `merge(branch, noFf?)` - Merge a branch
- `rebase(branch, interactive?)` - Rebase onto branch
- `cherryPick(hash)` - Cherry-pick a commit
- `revert(hash)` - Revert a commit

#### Stash Operations
- `stash(message?, includeUntracked?)` - Create a stash
- `stashList()` - List stashes
- `stashPop(index?)` - Pop a stash
- `stashApply(index?)` - Apply a stash
- `stashDrop(index?)` - Drop a stash
- `stashClear()` - Clear all stashes

#### Tag Operations
- `tag(name, message?, hash?)` - Create a tag
- `deleteTag(name)` - Delete a tag
- `listTags()` - List all tags

#### Remote Operations
- `remote()` - List remotes
- `addRemote(name, url)` - Add a remote
- `removeRemote(name)` - Remove a remote
- `renameRemote(oldName, newName)` - Rename a remote

#### Config Operations
- `getConfig(key)` - Get config value
- `setConfig(key, value, global?)` - Set config value

#### Diff and Clean
- `diff(file?, cached?)` - Get diff
- `diffStat(from?, to?)` - Get diff statistics
- `clean(force?, directories?)` - Clean untracked files

#### Reset
- `reset(mode, hash?)` - Reset repository

#### Blame
- `blame(file)` - Get file blame

## Testing

The library is designed to be highly testable. You can mock the Git service for testing:

```typescript
import { Effect } from "effect";
import { createGitRepository } from "@wpackages/git";

// Mock implementation for testing
const mockGit = createGitRepository("/test/path");

const testProgram = Effect.gen(function*() {
	const isRepo = yield* mockGit.isGitRepository("/test/path");
	// Test logic here
});
```

## Best Practices

1. **Always handle errors**: Use `Effect.catchAll` or `Effect.either` to handle Git errors gracefully.
2. **Use composition**: Combine multiple Git operations using `Effect.gen` for better readability.
3. **Provide meaningful messages**: Use descriptive commit messages and stash messages.
4. **Check repository state**: Use `isGitRepository()` before performing operations.
5. **Use appropriate merge strategies**: Consider using `--no-ff` for merge commits to preserve history.

## License

This project is licensed under the MIT License.
