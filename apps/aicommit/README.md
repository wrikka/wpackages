# aicommit 🚀

`aicommit` is a powerful command-line tool that uses AI to generate git commit messages for you based on your staged changes.

## Features

-   **Multiple LLM Support**: Works with OpenAI, Claude, and Mastra AI
-   **Config System**: Comprehensive configuration management
-   **Multiple Suggestions**: Generate multiple commit message options
-   **Locale Support**: Support for multiple languages
-   **Emoji Support**: Automatically add emojis to commit messages
-   **Commit Type Selection**: Choose from conventional commit types
-   **Git Hook Integration**: Automatic commit message generation
-   **Branch Ignore**: Skip AI commits on specific branches
-   **Custom Prompts**: Customize AI prompts for your needs
-   **Edit Before Commit**: Review and edit messages before committing

## Installation

1.  Clone this repository.
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Link the package to make the `aicommit` command available globally:
    ```bash
    bun link
    ```

## Configuration

Configuration is stored in `~/.aicommitrc.json`. Here's an example:

```json
{
  "llmProvider": "mastra",
  "locale": "en",
  "maxCommitLength": 50,
  "commitTypes": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
  "enableEmojis": true,
  "generateCount": 1,
  "enableGitHook": false,
  "enableHistory": true,
  "historyLimit": 100
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `llmProvider` | string | `mastra` | LLM provider to use (`openai`, `claude`, `mastra`) |
| `openaiApiKey` | string | - | OpenAI API key (required if using OpenAI) |
| `claudeApiKey` | string | - | Claude API key (required if using Claude) |
| `mastraApiKey` | string | - | Mastra API key (required if using Mastra) |
| `model` | string | - | AI model to use |
| `locale` | string | `en` | Language for commit messages |
| `maxCommitLength` | number | `50` | Maximum commit message length |
| `commitTypes` | string[] | `['feat', 'fix', ...]` | Available commit types |
| `enableEmojis` | boolean | `true` | Enable emoji in commit messages |
| `generateCount` | number | `1` | Number of commit message suggestions |
| `customPrompt` | string | - | Custom prompt for AI |
| `branchIgnore` | string[] | - | Branches to ignore |
| `enableGitHook` | boolean | `false` | Enable git hook integration |
| `enableHistory` | boolean | `true` | Enable commit history |
| `historyLimit` | number | `100` | Maximum history entries |

## Usage

### Manual Mode

1.  Navigate to any git repository on your machine.
2.  Stage the changes you want to commit:
    ```bash
    git add .
    ```
3.  Run the `aicommit` command:
    ```bash
    aicommit
    ```
4.  Review and edit the generated commit message, then press Enter to commit.

### Git Hook Mode

Install the git hook to automatically generate commit messages:

```bash
bun run hook:install
```

Now when you run `git commit` without a message, aicommit will automatically generate one for you.

To uninstall the hook:

```bash
bun run hook:uninstall
```

## Development

### Run Tests

```bash
bun test
```

### Run Linter

```bash
bun lint
```

### Build Project

```bash
bun build
```

## License

MIT
