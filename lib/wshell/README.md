# wshell

A type-safe shell powered by Effect-TS, focusing on functional programming principles and strong static typing.

## Features

- **Type-Safe Commands**: Built with TypeScript and Effect-TS schemas for compile-time validation
- **Command History**: Persistent command history with search capabilities
- **Auto-completion**: Tab completion for commands, files, and environment variables
- **Aliases**: Create shortcuts for frequently used commands
- **Environment Variables**: Manage shell environment variables
- **Hooks**: Execute custom code before/after commands
- **Plugins**: Extensible plugin system for custom functionality
- **Script Execution**: Run shell scripts with `.wsh` extension
- **Advanced Parser**: Support for pipes, redirects, and command chaining

## Architecture

wshell is built using a service-oriented architecture with Effect-TS:

### Core Services

- **ParserService**: Parses user input into structured commands
- **ExecutorService**: Executes commands (built-in or external)
- **DisplayService**: Handles output formatting and display
- **HistoryService**: Manages command history
- **CompletionService**: Provides auto-completion suggestions
- **AliasService**: Manages command aliases
- **EnvironmentService**: Manages environment variables
- **HookService**: Executes before/after command hooks
- **PluginService**: Manages plugins
- **ScriptService**: Executes shell scripts

### Built-in Commands

- `help [command]` - Show help for commands
- `history [clear|search]` - Manage command history
- `alias [name] [command]` - Manage aliases
- `env [name] [value]` - Manage environment variables
- `clear` - Clear the screen
- `exit` - Exit the shell

## Getting Started

### Installation

```bash
bun install
```

### Running

```bash
bun start
```

### Configuration

Create a `wshell.config.ts` file in your project root:

```typescript
import type { ShellConfig } from "./src/types/config";

export const config: ShellConfig = {
  theme: "default",
  promptStyle: ">",
  continuationPrompt: "...>",
  historySize: 1000,
  historyFile: "~/.wshell_history",
  aliases: {
    ll: "ls -la",
    g: "git",
  },
  envVars: {},
  plugins: [],
  hooks: {},
};
```

## Usage Examples

### Basic Commands

```bash
> ls
> ls -la
> echo "Hello, World!"
```

### Pipes and Redirects

```bash
> ls | grep test
> ls > output.txt
> cat file.txt | grep error >> errors.log
```

### Command Chaining

```bash
> ls && echo "Success"
> ls || echo "Failed"
> ls ; echo "Done"
```

### Environment Variables

```bash
> export NAME=wshell
> echo $NAME
> env NAME newvalue
> env --unset NAME
```

### Aliases

```bash
> alias ll "ls -la"
> ll
> alias --delete ll
```

### History

```bash
> history
> history search git
> history clear
```

## Scripting

Create a script file `myscript.wsh`:

```bash
# My script
echo "Starting script..."
ls -la
echo "Script complete!"
```

Run the script:

```bash
> source myscript.wsh
```

## Plugin Development

Create a plugin:

```typescript
export default {
  name: "my-plugin",
  version: "1.0.0",
  enabled: true,
  onLoad: () => {
    console.log("Plugin loaded!");
  },
  onUnload: () => {
    console.log("Plugin unloaded!");
  },
};
```

Add to config:

```typescript
export const config: ShellConfig = {
  // ...
  plugins: ["./plugins/my-plugin.ts"],
};
```

## Hooks

Define hooks in config:

```typescript
export const config: ShellConfig = {
  // ...
  hooks: {
    beforeCommand: "(context) => console.log('Running:', context.command.name)",
    afterCommand: "(context, result) => console.log('Done!')",
    onError: "(context, error) => console.error('Error:', error)",
  },
};
```

## Testing

```bash
bun test
```

## Development

```bash
bun run dev      # Watch mode
bun run lint     # Lint code
bun run build    # Build
```

## Project Structure

```
src/
├── commands/       # Built-in commands
├── components/     # UI components
├── config/         # Configuration
├── constant/       # Constants
├── lib/            # Libraries
├── services/       # Core services
├── types/          # Type definitions
└── utils/          # Utilities
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
