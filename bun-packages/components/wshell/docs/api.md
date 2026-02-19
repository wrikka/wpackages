# API Documentation

This document provides an overview of the core services in `wshell`.

## Core Services

### `ParserService`

Responsible for parsing raw string input into a structured `Command` object.

- **`parse(input: string): Effect<Command, ParseError>`**: Takes a string and returns an `Effect` that resolves to a `Command` or fails with a `ParseError`.

### `ExecutorService`

Responsible for executing a `Command`.

- **`execute(command: Command): Effect<void, ExecuteError>`**: Takes a `Command` object, executes it (either as a built-in or an external process), and returns an `Effect` that completes on success or fails with an `ExecuteError`.

### `DisplayService`

Responsible for displaying output to the console.

- **`display(value: ShellValue): Effect<void, never>`**: Takes a `ShellValue` (string, table, or void) and prints it to the console.

### `HistoryService`

Manages command history.

- **`addEntry(command: string): Effect<void, HistoryError>`**: Adds a command to history.
- **`getPrevious(currentIndex: number): Effect<string | null, HistoryError>`**: Gets the previous command from history.
- **`getNext(currentIndex: number): Effect<string | null, HistoryError>`**: Gets the next command from history.
- **`search(query: string): Effect<HistoryEntry[], HistoryError>`**: Searches history for commands matching the query.
- **`saveToFile(): Effect<void, HistoryError>`**: Saves history to file.
- **`loadFromFile(): Effect<void, HistoryError>`**: Loads history from file.
- **`clear(): Effect<void, HistoryError>`**: Clears command history.
- **`getAll(): Effect<HistoryEntry[], HistoryError>`**: Gets all history entries.

### `CompletionService`

Provides auto-completion suggestions.

- **`completeCommand(input: string): Effect<CompletionItem[], CompletionError>`**: Completes command names.
- **`completeArgument(command: string, input: string): Effect<CompletionItem[], CompletionError>`**: Completes command arguments.
- **`completeFilePath(input: string): Effect<CompletionItem[], CompletionError>`**: Completes file paths.
- **`completeEnvVar(input: string): Effect<CompletionItem[], CompletionError>`**: Completes environment variables.
- **`getSuggestions(input: string): Effect<CompletionItem[], CompletionError>`**: Gets suggestions based on input.
- **`filterSuggestions(suggestions: CompletionItem[], input: string): Effect<CompletionItem[], CompletionError>`**: Filters suggestions by input.

### `AliasService`

Manages command aliases.

- **`addAlias(name: string, command: string, description?: string): Effect<void, never>`**: Adds an alias.
- **`removeAlias(name: string): Effect<void, never>`**: Removes an alias.
- **`getAlias(name: string): Effect<Alias | null, never>`**: Gets an alias by name.
- **`listAliases(): Effect<Alias[], never>`**: Lists all aliases.
- **`expandAlias(input: string): Effect<string, never>`**: Expands an alias to its full command.
- **`saveAliases(): Effect<void, never>`**: Saves aliases to config.

### `EnvironmentService`

Manages environment variables.

- **`setVar(name: string, value: string, readonly?: boolean): Effect<void, never>`**: Sets an environment variable.
- **`getVar(name: string): Effect<string | null, never>`**: Gets an environment variable value.
- **`unsetVar(name: string): Effect<void, never>`**: Unsets an environment variable.
- **`listVars(): Effect<EnvironmentVariable[], never>`**: Lists all environment variables.
- **`expandVars(input: string): Effect<string, never>`**: Expands variables in a string.

### `HookService`

Manages command hooks.

- **`registerHook(hook: Hook): Effect<void, HookError>`**: Registers a hook.
- **`unregisterHook(name: string): Effect<void, HookError>`**: Unregisters a hook.
- **`executeBeforeHooks(command: Command): Effect<Command, HookError>`**: Executes before hooks.
- **`executeAfterHooks(command: Command, result: unknown): Effect<void, HookError>`**: Executes after hooks.
- **`executeErrorHooks(command: Command, error: unknown): Effect<void, HookError>`**: Executes error hooks.
- **`listHooks(): Effect<Hook[], HookError>`**: Lists all hooks.

### `PluginService`

Manages plugins.

- **`loadPlugin(name: string, path: string): Effect<Plugin, PluginError>`**: Loads a plugin.
- **`unloadPlugin(name: string): Effect<void, PluginError>`**: Unloads a plugin.
- **`listPlugins(): Effect<Plugin[], PluginError>`**: Lists all plugins.
- **`getPlugin(name: string): Effect<Plugin | null, PluginError>`**: Gets a plugin by name.
- **`loadAllPlugins(): Effect<void, PluginError>`**: Loads all plugins from config.

### `ScriptService`

Executes shell scripts.

- **`executeScript(script: Script): Effect<void, ScriptError>`**: Executes a script.
- **`parseScript(content: string): Effect<Script, ScriptError>`**: Parses script content.
- **`validateScript(script: Script): Effect<Script, ScriptError>`**: Validates a script.
- **`runScriptFile(path: string, args?: string[]): Effect<void, ScriptError>`**: Runs a script file.

## Utility Functions

### Tokenizer

- **`tokenize(input: string): Effect<Token[], never>`**: Tokenizes input string into tokens.

### Parser Advanced

- **`parseTokens(tokens: Token[]): Effect<ParsedCommand, ParseError>`**: Parses tokens into a parsed command.

## Error Types

All services use typed errors for better error handling:

- `ParseError`: Errors during parsing
- `ExecuteError`: Errors during command execution
- `HistoryError`: Errors in history operations
- `CompletionError`: Errors in completion
- `ConfigError`: Errors in configuration
- `PluginError`: Errors in plugin operations
- `HookError`: Errors in hook operations
- `ScriptError`: Errors in script execution
