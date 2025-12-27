# git

Git repository interaction utilities

## Installation

```bash
bun add git
```

## Features

- Type-safe API
- Functional programming approach
- Zero dependencies (or minimal)
- Fully tested

## Usage

```typescript
import { isGitRepository, getCurrentBranch } from 'git';

// Check if a directory is a git repository
isGitRepository('.').then(isRepo => {
  if (isRepo) {
    console.log('This is a Git repository.');
    // Get the current branch
    getCurrentBranch('.').then(branch => {
      if (branch) {
        console.log(`Current branch is: ${branch}`);
      }
    });
  }
});
```

## API

### Functions

### `isGitRepository(path: string): Promise<boolean>`

Checks if a directory is a Git repository by verifying the existence of the `.git` directory.

### `getCurrentBranch(path: string): Promise<string | null>`

Gets the current branch name of a Git repository. Returns `null` if not in a Git repository or on a detached HEAD.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Review (format, lint, test, build)
bun run review
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT
