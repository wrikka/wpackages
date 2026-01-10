# @wpackages/presets

Presets and configurations for wpackages workspace with theme, config, and app composition.

## Features

- **Theme System**: Complete theming support with light/dark mode, color palettes, typography, spacing, and border radius
- **Config Schema**: Type-safe configuration validation using `@effect/schema`
- **Environment Config**: Environment variable management with type safety
- **Error Handling**: Integrated error logging with `@wpackages/error`
- **Logging**: Built-in logging support via `@wpackages/observability`
- **App Composition**: Effect-based application composition pattern

## Installation

```bash
bun add @wpackages/presets
```

## Usage

### Basic App Composition

```typescript
import { Effect } from "effect";
import { createApp } from "@wpackages/presets";

const myProgram = Effect.sync(() => {
	console.log("Hello, World!");
	return "Success";
});

await createApp(myProgram);
```

### Theme System

```typescript
import { AppTheme, DarkTheme, type Theme } from "@wpackages/presets";

// Use default theme
console.log(AppTheme.colors.primary);

// Use dark theme
console.log(DarkTheme.colors.background);

// Custom theme
const customTheme: Theme = {
	mode: "light",
	colors: {
		primary: "#FF0000",
		secondary: "#00FF00",
		background: "#FFFFFF",
		foreground: "#000000",
		surface: "#F3F4F6",
		border: "#E5E7EB",
		error: "#EF4444",
		warning: "#F59E0B",
		success: "#10B981",
		info: "#3B82F6",
	},
	typography: {
		fontFamily: "Inter, sans-serif",
		fontSize: {
			xs: "0.75rem",
			sm: "0.875rem",
			base: "1rem",
			lg: "1.125rem",
			xl: "1.25rem",
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75,
		},
	},
	spacing: {
		xs: "0.25rem",
		sm: "0.5rem",
		md: "1rem",
		lg: "1.5rem",
		xl: "2rem",
	},
	borderRadius: {
		sm: "0.25rem",
		md: "0.375rem",
		lg: "0.5rem",
		full: "9999px",
	},
};
```

### Config Validation

```typescript
import { ThemeSchema } from "@wpackages/presets";
import { Schema } from "@effect/schema";

const myTheme = {
	mode: "light",
	colors: {
		primary: "#FF0000",
		// ... other fields
	},
	// ... other fields
};

const result = Schema.decodeUnknownSync(ThemeSchema)(myTheme);
console.log(result);
```

### Environment Config

```typescript
import { getEnv, type EnvConfig } from "@wpackages/presets";

const env = getEnv();
console.log(env.NODE_ENV); // "development" | "production" | "test"
console.log(env.LOG_LEVEL); // "debug" | "info" | "warn" | "error"
console.log(env.THEME_MODE); // "light" | "dark" | "auto"
```

### Error Handling

```typescript
import { logError } from "@wpackages/presets";
import { AppError } from "@wpackages/error";

try {
	throw new AppError({
		message: "Something went wrong",
		statusCode: 500,
		isOperational: true,
	});
} catch (error) {
	logError(error as Error);
}
```

## API Reference

### `createApp<A, E>(program: Effect.Effect<A, E>)`

Creates and runs an Effect program with logging support.

### `AppTheme: Theme`

Default light theme configuration.

### `DarkTheme: Theme`

Dark theme configuration.

### `getEnv(): EnvConfig`

Gets environment configuration with type safety.

### `logError(error: Error | AppError)`

Logs error with context information.

## Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `"development" \| "production" \| "test"` | `"development"` | Application environment |
| `LOG_LEVEL` | `"debug" \| "info" \| "warn" \| "error"` | `"info"` | Logging level |
| `THEME_MODE` | `"light" \| "dark" \| "auto"` | `"auto"` | Theme mode |

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests with coverage
bun run test:coverage

# Lint
bun run lint

# Format
bun run format

# Build
bun run build

# Verify all checks
bun run verify
```

## Dependencies

- `@wpackages/observability` - Logging and observability
- `@wpackages/error` - Error handling utilities
- `@effect/schema` - Schema validation
- `effect` - Functional effect system

## License

MIT
