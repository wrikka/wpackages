# parser

🚀 **Universal Multi-Language Parser** - Parse 13+ languages with a single, unified, functional API

> Type-safe, zero-config, extensible parser with Result-based error handling

## ✨ Features

### Core
- **🌍 Multi-Language**: Parse 13+ languages (JS/TS/JSX/TSX, JSON, YAML, TOML, Markdown, HTML, XML, CSS/SCSS)
- **🎯 Auto-Detection**: Automatically detects language from file extension
- **⚡ Fast Parsing**: JavaScript/TypeScript powered by OXC (fastest parser available)
- **🌳 AST Support**: Full Abstract Syntax Tree for JS/TS, Markdown, HTML, XML, CSS
- **🛡️ Type-Safe**: Full TypeScript support with excellent type inference
- **🔧 Zero Config**: Works out of the box with sensible defaults
- **📦 Functional API**: Result type for safe error handling without exceptions
- **🎨 Pure Functions**: No side effects, fully composable
- **🔌 Extensible**: Register custom parsers for additional languages
- **📝 Well-Tested**: Comprehensive test coverage with vitest
- **🎓 Well-Documented**: Detailed examples and usage patterns

### Advanced
- **🔍 AST Utilities**: Traverse, find, and analyze AST nodes
- **📥 Import/Export Analysis**: Extract imports and exports from code
- **🏗️ Language Detection**: Intelligent language detection with fallbacks
- **⚙️ Configurable**: Per-parser options and global configuration
- **🚀 Performance**: Caching support and optimized parsing
- **🧩 Composable**: Functional composition of parsers and utilities

## 🌐 Supported Languages (16+)

| Language | Extensions | AST Support | Parser | Category |
|----------|-----------|-------------|---------|----------|
| **JavaScript** | `.js`, `.mjs`, `.cjs` | ✅ | OXC | Code |
| **TypeScript** | `.ts`, `.mts`, `.cts` | ✅ | OXC | Code |
| **JSX** | `.jsx` | ✅ | OXC | Code |
| **TSX** | `.tsx` | ✅ | OXC | Code |
| **JSON** | `.json`, `.jsonc` | ❌ | Native | Data |
| **YAML** | `.yaml`, `.yml` | ❌ | yaml | Data |
| **TOML** | `.toml` | ❌ | smol-toml | Data |
| **Markdown** | `.md`, `.mdx` | ✅ | marked | Markup |
| **HTML** | `.html`, `.htm` | ✅ | parse5 | Markup |
| **XML** | `.xml`, `.svg` | ✅ | fast-xml-parser | Markup |
| **CSS** | `.css` | ✅ | PostCSS | Style |
| **SCSS** | `.scss` | ✅ | PostCSS | Style |
| **GraphQL** | `.graphql`, `.gql` | ✅ | Custom | Query |
| **SQL** | `.sql` | ✅ | Custom | Query |
| **Dockerfile** | `Dockerfile` | ✅ | Custom | Config |
| **JSON5** | `.json5` | ❌ | Custom | Data |

### Coming Soon
- Python, Rust, Go, Java, C#, PHP, Ruby
- Properties, INI, CSV files
- Shell/Bash scripts

## 🏗️ Architecture

```
src/
├── components/      # Pure Functions (formatting, display)
├── config/          # Configuration & defaults
├── constant/        # Language definitions & metadata
├── lib/             # Third-party wrappers (OXC)
├── parsers/         # Language-specific parsers (13 parsers)
├── services/        # Universal parser & file operations
├── types/           # Type definitions
├── utils/           # Pure utilities (AST, imports, detection)
└── index.ts         # Main export
```

### Design Principles

- **Functional**: Pure functions, no side effects
- **Type-Safe**: Full TypeScript with strict types
- **Composable**: Functions can be easily combined
- **Testable**: Comprehensive test coverage
- **Maintainable**: Clear separation of concerns

## 📦 Installation

```bash
bun add parser
```

## 🚀 Quick Start

```typescript
import { parse, Result } from 'parser';

// Parse any file - auto-detects language
const result = await parse('{ "name": "test" }', 'config.json');

if (Result.isOk(result)) {
  console.log('Language:', result.value.language);
  console.log('Data:', result.value.data);
} else {
  console.error('Error:', result.error);
}
```

## 📖 Usage

### Universal Parser (Auto-Detection)

The simplest way to parse any file - automatically detects the language:

```typescript
import { parse, parseFile, Result } from 'parser';

// Parse from string with auto-detection
const result = parse('{ "name": "test" }', 'config.json');

// Parse file with auto-detection
const fileResult = await parseFile('./config.yaml');

if (Result.isOk(fileResult)) {
  console.log('✓ Parsed successfully');
  console.log('Language:', fileResult.value.language);
  console.log('Data:', fileResult.value.data);
}
```

### Parse Multiple Files

```typescript
import { parseMultipleFiles, Result } from 'parser';

const files = [
  './config.json',
  './data.yaml',
  './style.css',
  './index.ts'
];

const results = await parseMultipleFiles(files);

results.forEach((result, i) => {
  if (Result.isOk(result)) {
    console.log(`✓ ${files[i]}: ${result.value.language}`);
  }
});
```

### Language-Specific Parsers

For more control, use language-specific parsers:

```typescript
import { 
  parseJSON,
  parseYAML_source,
  parseTOML_source,
  parseMarkdown,
  parseTypeScript,
  Result 
} from 'parser';

// JSON
const json = parseJSON('{"key": "value"}', 'data.json');

// YAML
const yaml = parseYAML_source('key: value', 'config.yaml');

// TypeScript with AST
const ts = parseTypeScript('const x: number = 42', 'index.ts');

if (Result.isOk(ts)) {
  console.log('AST:', ts.value.data.program);
}

// Markdown with AST
const md = parseMarkdown('# Hello\n\nWorld', 'doc.md');

if (Result.isOk(md)) {
  console.log('Tokens:', md.value.data);
}
```

### Legacy API (Backward Compatible)

The original API still works for JavaScript/TypeScript:

```typescript
import { parseSource, Result } from 'parser';

const code = `const greet = (name: string) => console.log(name);`;
const result = parseSource(code, 'example.ts', { typescript: true });

if (Result.isOk(result)) {
  console.log('AST:', result.value.ast);
}
```

## API

### Universal Parser

#### `parse(source, filename, options?)`

Parse any supported language with auto-detection.

- **source**: Source code string
- **filename**: Filename (used for language detection and error messages)
- **options**: `ParseOptionsBase`
  - `language?`: Override auto-detection
  - `strict?`: Strict parsing mode
  - Parser-specific options

Returns: `Result<GenericParseResult, string>`

#### `parseFile(filePath, options?)`

Parse a file from disk with auto-detection.

- **filePath**: Path to file
- **options**: `ParseOptionsBase`

Returns: `Promise<Result<GenericParseResult, string>>`

#### `parseMultipleFiles(filePaths, options?)`

Parse multiple files concurrently.

- **filePaths**: Array of file paths
- **options**: `ParseOptionsBase`

Returns: `Promise<Result<GenericParseResult, string>[]>`

### Parser Registry

#### `getParser(language)`

Get parser for a specific language.

#### `registerParser(language, parser)`

Register a custom parser.

#### `getSupportedLanguages()`

Get all supported languages.

#### `isLanguageSupported(language)`

Check if a language is supported.

## Types

### `GenericParseResult<T>`

Universal parse result for all languages:

```typescript
type GenericParseResult<T = unknown> = {
  readonly data: T;                    // Parsed data or AST
  readonly language: Language;         // Detected language
  readonly errors: readonly ParseError[];
  readonly metadata?: Record<string, unknown>;
};
```

### `Language`

Supported languages:

```typescript
type Language = 
  | "javascript" | "typescript" | "jsx" | "tsx"
  | "json" | "yaml" | "toml"
  | "markdown" | "html" | "xml"
  | "css" | "scss" | "less"
  | "unknown";
```

### `Parser<T>`

Base parser interface:

```typescript
interface Parser<T = unknown> {
  readonly name: string;
  readonly supportedLanguages: readonly Language[];
  parse: (source: string, filename: string, options?: ParseOptionsBase) 
    => Result.Result<GenericParseResult<T>, string>;
}
```

### `Result<T, E>`

Functional Result type for error handling:

```typescript
type Result<T, E> = Ok<T> | Err<E>;

// Check result
if (Result.isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// Utility methods
Result.map(result, fn);
Result.flatMap(result, fn);
Result.unwrap(result);
Result.unwrapOr(result, defaultValue);
```

## Advanced Usage

### Custom Parser Registration

```typescript
import { registerParser, type Parser } from 'parser';

const myParser: Parser<MyAST> = {
  name: 'my-parser',
  supportedLanguages: ['mylang'],
  parse: (source, filename, options) => {
    // Your parsing logic
    return Result.ok({ data: ast, language: 'mylang', errors: [] });
  }
};

registerParser('mylang', myParser);
```

### Language Detection

```typescript
import { detectLanguage, getLanguageInfo, supportsAST } from 'parser';

const lang = detectLanguage('config.yaml'); // 'yaml'
const info = getLanguageInfo(lang);
console.log(info?.category); // 'data'
console.log(supportsAST(lang)); // false
```

### AST Utilities (JavaScript/TypeScript)

```typescript
import { parseTypeScript, traverse, findImports, Result } from 'parser';

const result = parseTypeScript('import { x } from "y";', 'index.ts');

if (Result.isOk(result)) {
  const ast = result.value.data.program;
  
  // Traverse AST
  traverse(ast, (node) => {
    console.log(node.type);
  });
  
  // Find imports
  const imports = findImports(ast);
  console.log(imports); // [{ source: 'y', specifiers: ['x'], ... }]
}
```

## Why parser?

- **Universal**: One parser for all your file formats
- **Fast**: OXC for JavaScript/TypeScript is faster than Babel or SWC
- **Safe**: Result type prevents uncaught exceptions
- **Simple**: Zero configuration with auto-detection
- **Extensible**: Register custom parsers for any language
- **Type-Safe**: Full TypeScript support with excellent type inference
- **Functional**: Pure functions, no side effects

## 💡 Best Practices

### 1. Always Handle Results

```typescript
import { Result } from 'parser';

const result = await parseFile('./config.json');

// ✅ Good: Pattern match on result
if (Result.isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// ✅ Good: Use functional methods
Result.map(result, (data) => data.language);
Result.flatMap(result, (data) => processData(data));
```

### 2. Compose Parsers

```typescript
import { parse, Result } from 'parser';

const parseAndValidate = async (source: string, filename: string) => {
  const result = await parse(source, filename);
  
  return Result.flatMap(result, (parsed) => {
    // Validate parsed data
    if (parsed.errors.length > 0) {
      return Result.err('Validation failed');
    }
    return Result.ok(parsed);
  });
};
```

### 3. Use Type Guards

```typescript
import { supportsAST, getLanguageInfo } from 'parser';

const result = await parse(source, 'file.ts');

if (Result.isOk(result)) {
  const { language } = result.value;
  
  if (supportsAST(language)) {
    // Safe to access AST
    const ast = result.value.data;
  }
  
  const info = getLanguageInfo(language);
  console.log(`Category: ${info?.category}`);
}
```

### 4. Handle Large Files

```typescript
import { parseMultipleFiles } from 'parser';

// Parse multiple files concurrently
const results = await parseMultipleFiles([
  'file1.json',
  'file2.yaml',
  'file3.toml',
]);

// Process results
results.forEach((result, i) => {
  if (Result.isOk(result)) {
    console.log(`✓ Parsed ${result.value.language}`);
  } else {
    console.error(`✗ Error: ${result.error}`);
  }
});
```

## 🧪 Testing

```bash
# Run tests
bun run test

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage
```

## 🔨 Development

```bash
# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Full review
bun run review
```

## 📊 Performance

- **OXC Parser**: ~10x faster than Babel for JS/TS
- **Caching**: Optional result caching for repeated parses
- **Concurrent**: Parse multiple files in parallel
- **Memory**: Efficient AST representation

## 🤝 Contributing

Contributions welcome! Please ensure:
- Tests pass: `bun run test`
- Code is formatted: `bun run format`
- Linting passes: `bun run lint`
- Types are correct: `tsc --noEmit`

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 📄 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

- **OXC**: Fastest JavaScript/TypeScript parser
- **Marked**: Markdown parsing
- **Parse5**: HTML parsing
- **YAML**: YAML parsing
- **PostCSS**: CSS parsing
- **Bun**: Runtime and package manager
