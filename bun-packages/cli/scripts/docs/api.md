# API Reference

This document provides a detailed reference for the APIs available in `@wpackages/scripts`.

### Types

- `Script` - Script configuration interface
- `ScriptResult` - Script execution result interface
- `ScriptRunnerConfig` - Script runner configuration interface

### Services

- `ScriptRunnerService` - Main service for script execution
- `runScript` - Run a single script
- `runScripts` - Run multiple scripts
- `runScriptByName` - Run a script by name
- `listScripts` - List all available scripts

### Components

- `renderScriptInfo` - Render script information for CLI
- `renderScriptResults` - Render script results for CLI
- `renderScriptList` - Render script list for CLI
- `renderHelp` - Render help information for CLI

### Utilities

- `isValidScript` - Validate script configuration
- `formatScriptResult` - Format script result for display
- `sortScriptsByDependencies` - Sort scripts by dependencies
- `filterScriptsByName` - Filter scripts by name pattern

### Advanced Services

- `executeScriptWithTimeout` - Execute script with timeout support
- `executeScriptWithRetry` - Execute script with automatic retry
- `dryRunScript` - Simulate script execution
- `validateAdvancedScriptConfig` - Validate advanced script options
- `formatScriptExecutionInfo` - Format detailed script information
