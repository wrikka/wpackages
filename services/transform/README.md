# transform

Universal document transformer - Convert between MD, TS, TOML, JSON formats using OXC parser.

## Features

- 🚀 **Fast** - Powered by OXC parser (Rust-based)
- 🔄 **Bidirectional** - Convert between multiple formats
- 🎯 **Auto-detection** - Automatically detect source format
- 📦 **Zero-config** - Works out of the box
- 🛠️ **Functional** - Pure functions with composable transformers

## Supported Formats

- **Markdown** (`.md`)
- **TypeScript/JavaScript** (`.ts`, `.js`)
- **TOML** (`.toml`)
- **JSON** (`.json`)

## Supported Transformations

| From       | To         | Status |
| ---------- | ---------- | ------ |
| JSON       | TOML       | ✅     |
| TOML       | JSON       | ✅     |
| JSON       | Markdown   | ✅     |
| Markdown   | JSON       | ✅     |
| TypeScript | JSON (AST) | ✅     |
| TypeScript | Markdown   | ✅     |
| TOML       | Markdown   | ✅     |
| JSON       | TypeScript | ✅     |

## Installation

```bash
bun add transform
```

## Usage

### Basic Transform

```typescript
import { transform } from "transform";

// JSON to TOML
const toml = transform("{\"name\": \"test\"}", "json", "toml");
// => name = "test"

// TOML to JSON
const json = transform("name = \"test\"", "toml", "json");
// => {"name":"test"}

// Auto-detect source format
const result = transform("{\"key\": \"value\"}", "auto", "toml");
// => key = "value"
```

### JSON Array to Markdown Table

```typescript
import { transform } from "transform";

const data = [
	{ name: "Alice", age: 30 },
	{ name: "Bob", age: 25 },
];

const markdown = transform(JSON.stringify(data), "json", "markdown");
```

Output:

```markdown
| name  | age |
| ----- | --- |
| Alice | 30  |
| Bob   | 25  |
```

### TypeScript to JSON AST

```typescript
import { transform } from "transform";

const code = "const x = 1;";
const ast = transform(code, "typescript", "json", { pretty: true });
// Returns TypeScript AST as JSON
```

### TypeScript to Markdown

```typescript
import { transform } from "transform";

const code = "const x: number = 10;";
const markdown = transform(code, "typescript", "markdown");
```

Output:

````markdown
```typescript
const x: number = 10;
```
````

### TOML to Markdown

```typescript
import { transform } from "transform";

const toml = `
[package]
name = "my-app"
version = "0.1.0"
`;
const markdown = transform(toml, "toml", "markdown");
```

Output:

```markdown
### package

- **name**: my-app
- **version**: 0.1.0
```

### Markdown to JSON

```typescript
import { transform } from "transform";

const markdown = `
| name  | age |
| ----- | --- |
| Alice | 30  |
| Bob   | 25  |
`;

const json = transform(markdown, "markdown", "json", { pretty: true });
```

Output:

```json
[
	{
		"name": "Alice",
		"age": "30"
	},
	{
		"name": "Bob",
		"age": "25"
	}
]
```

### JSON to TypeScript Type

```typescript
import { transform } from "transform";

const json = `{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "roles": ["admin", "user"]
  }
}`;

const tsType = transform(json, "json", "typescript");
```

Output:

```typescript
export type GeneratedType = {
	user: {
		name: string;
		email: string;
		roles: string[];
	};
};
```

### Using Parsers Directly

```typescript
import { JsonParser, TomlParser } from "transform";

// Parse
const ast = JsonParser.parse("{\"key\": \"value\"}");

// Stringify
const json = JsonParser.stringify(ast, { pretty: true, indent: 2 });
```

### Using Transformers

```typescript
import { JsonToTomlTransformer } from "transform";

const toml = JsonToTomlTransformer.transform("{\"name\": \"test\"}");
```

### Format Detection

```typescript
import { detectFormat } from "transform";

detectFormat("{\"key\": \"value\"}"); // => 'json'
detectFormat("# Hello", "README.md"); // => 'markdown'
detectFormat("const x = 1;"); // => 'typescript'
```

## API

### `transform(source, from, to, options?, filename?)`

Transform document from one format to another.

- **source**: Source document content
- **from**: Source format or 'auto' for auto-detection
- **to**: Target format
- **options**: Transform options
  - `pretty?: boolean` - Pretty print output (default: true)
  - `indent?: number` - Indentation spaces (default: 2)
- **filename**: Optional filename for format detection

### Parsers

Each parser implements the `Parser<T>` interface:

```typescript
interface Parser<T> {
	format: DocumentFormat;
	parse: (content: string) => T;
	stringify: (ast: T, options?: TransformOptions) => string;
}
```

Available parsers:

- `JsonParser`
- `TomlParser`
- `MarkdownParser`
- `TypeScriptParser` (using OXC)

### Transformers

Each transformer implements the `Transformer` interface:

```typescript
interface Transformer {
	from: DocumentFormat;
	to: DocumentFormat;
	transform: (source: string, options?: TransformOptions) => string;
}
```

## Architecture

Follows functional programming principles:

```
src/
├── app.ts          # Core transform logic
├── constant/       # Constants (e.g., transformer map)
├── lib/            # 3rd-party wrappers
├── pipelines/      # Transformers
├── services/       # Parsers and other side-effects
├── types/          # Type definitions
├── utils/          # Pure utility functions
└── index.ts        # Public API entry point
```

## Performance

Built on top of OXC (Oxidation Compiler) - a Rust-based JavaScript parser that is:

- **20x faster** than Babel
- **2x faster** than SWC
- Memory efficient

## License

MIT
