# API

This package is a thin wrapper around `@wpackages/scripts` and re-exports its public API.

It also re-exports `defineConfig` from `@wpackages/config-manager` for configuration authoring.

## Imports

```ts
import { defineConfig } from "@wpackages/utils-scripts";
import {
	ScriptRunnerService,
	ScriptRunnerServiceLive,
	renderScriptResults,
} from "@wpackages/utils-scripts";
```

## `defineConfig`

Use `defineConfig` as an identity helper for type inference.

```ts
export default defineConfig({
	scripts: {
		build: {
			name: "build",
			command: "bun run build",
		},
	},
});
```

## Services

### `ScriptRunnerService`

Provides:

- `listScripts()`
- `runScriptByName(name)`
- `runScripts(scripts)`

To run the service you must provide a layer (e.g. `ScriptRunnerServiceLive`).

## CLI Components

### `renderScriptResults(results)`

Formats an array of script execution results for terminal output.
