# @wpackages/macros-bun

A collection of useful Bun macros for build-time code generation.

## Features

### Core Macros

- `embed` - Embed file contents at build time
- `embedGlob` - Embed multiple files matching glob patterns
- `embedBase64` - Embed files as base64 data URIs
- `embedGlobFull` - Enhanced glob with full pattern support (*, **, ?, [abc], {a,b,c}, !(pattern))
- `embedOptimized` - Embed optimized files with compression

### Environment Variables

- `env` - Type-safe environment variable access with automatic type conversion
- `envTyped` - Type-safe environment variable access with explicit type
- `envRequired` - Required environment variable that throws if not set
- `envSchema` - Schema-based environment variable validation

### Logging

- `log` - Compile-time logging with source location
- `log.debug`, `log.info`, `log.warn`, `log.error` - Log levels support
- `log.group` - Grouped logging

### Build-time Control

- `assert` - Compile-time assertions
- `ifdef`, `ifndef`, `ifAll`, `ifAny` - Conditional compilation

### Code Generation

- `writeConfig`, `writeConfigs` - Config file generation
- `generateSchema` - JSON schema generation from types
- `generate` - Code generation from templates
- `generateDocs`, `generateReadme` - Documentation generation
- `generateTests`, `generateTestStub` - Test generation

### Internationalization

- `i18n`, `t` - Build-time i18n support

### CSS

- `extractCSS`, `extractCSSClass`, `extractCSSStyle` - CSS-in-JS extraction

### Database

- `validateSchema` - Database schema validation
- `migrate`, `createMigration` - Migration scripts

### Version

- `version`, `versionInfo`, `buildTimestamp` - Version management

### Performance

- `benchmark`, `compareBenchmarks` - Build-time benchmarking

## Installation

```bash
bun add @wpackages/macros-bun
```

## Usage

### embed

Embed file contents at build time. The file is read during bundling and the content is inlined into your code.

```typescript
import { embed } from "@wpackages/macros-bun";

const content = embed("./data.json");
console.log(content); // File content as string
```

### embedGlob

Embed multiple files matching a glob pattern at build time. Supports basic glob patterns: `*` (any characters), `**` (any directories).

```typescript
import { embedGlob } from "@wpackages/macros-bun";

// Embed all JSON files in data directory
const dataFiles = embedGlob("./data/*.json");

// Embed all files recursively
const allFiles = embedGlob("./data/**/*");

// Embed all text files
const textFiles = embedGlob("./data/**/*.txt");
```

### env

Type-safe environment variable access with automatic type conversion. The macro automatically infers and converts types.

```typescript
import { env } from "@wpackages/macros-bun";

// String (default)
const apiKey = env("API_KEY");

// Number - automatically converts
const port = env<number>("PORT", "3000");

// Boolean - converts "true"/"false" to boolean
const debug = env<boolean>("DEBUG", "false");

// JSON - parses JSON string
const config = env<Record<string, unknown>>("CONFIG", "{}");
```

### envTyped

Type-safe environment variable access with explicit type specification.

```typescript
import { envTyped } from "@wpackages/macros-bun";

const port = envTyped("PORT", "number", "3000");
const debug = envTyped("DEBUG", "boolean", "false");
const config = envTyped("CONFIG", "json", "{}");
const name = envTyped("NAME", "string", "default");
```

### log

Compile-time logging with automatic source location (file path and line number).

```typescript
import { log } from "@wpackages/macros-bun";

log("Hello, world!");
log("User:", user);
log("Processing", items.length, "items");
```

### Log Levels

Log at different levels with automatic source location.

```typescript
import { log } from "@wpackages/macros-bun";

log.debug("Debug info:", data);
log.info("Server started on port", port);
log.warn("Deprecated API usage");
log.error("Failed to connect:", error);
```

### embedBase64

Embed file contents as base64 data URI at build time. Useful for images, fonts, or binary files.

```typescript
import { embedBase64 } from "@wpackages/macros-bun";

const logo = embedBase64("./logo.png");
// "data:image/png;base64,iVBORw0KGgo..."

const font = embedBase64("./font.woff2");
// "data:font/woff2;base64,..."
```

### envRequired

Required environment variable that throws at build time if not set.

```typescript
import { envRequired } from "@wpackages/macros-bun";

const apiKey = envRequired("API_KEY");
// Error at build time if API_KEY is not set
```

### log.group

Group multiple log statements under a single label.

```typescript
import { log } from "@wpackages/macros-bun";

log.group("User Processing", () => {
	log.debug("Loading user:", userId);
	log.info("Processing...");
});
```

### assert

Compile-time assertion that throws at build time if condition is false.

```typescript
import { assert } from "@wpackages/macros-bun";

assert(process.env.NODE_ENV === "production", "Must be production");
assert(
	typeof API_KEY === "string" && API_KEY.length > 0,
	"API_KEY must be set",
);
```

## Development

```bash
bun install
bun run dev
bun run test
bun run lint
bun run build
```

## License

MIT
