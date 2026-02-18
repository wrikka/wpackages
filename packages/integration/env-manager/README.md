# @wpackages/env-manager

> A powerful CLI tool for managing environment variables with validation, encryption, and more

A comprehensive environment variable management tool built with Effect-TS. Supports loading, validating, encrypting, and managing `.env` files with schema validation and security auditing.

## ✨ Features

- 📁 **Multi-file Loading**: Load and merge multiple `.env` files
- ✅ **Schema Validation**: Validate environment variables against JSON schemas
- 🔒 **Encryption/Decryption**: Secure sensitive environment values
- 🔍 **Security Audit**: Detect exposed secrets and security issues
- 📝 **Example Generation**: Auto-generate `.env.example` files
- 🔄 **Diff & Merge**: Compare and merge environment files
- 📋 **Templates**: Save, load, and manage environment templates
- 🔧 **Type Generation**: Generate TypeScript types from environment
- 🌐 **Web UI**: Built-in web interface for visual management
- 🔐 **Lock Files**: Ensure consistent environment across team

## 📦 Installation

```bash
bun add @wpackages/env-manager
```

Or use as a CLI tool:

```bash
bun link
wenv --help
```

## 🚀 Quick Start

### Basic Usage

```bash
# Load and display all .env files in current directory
wenv

# Load specific files
wenv .env.local .env.production

# Output in dotenv format
wenv --output dotenv

# Override process.env
wenv --override
```

### Schema Validation

```bash
# Validate against schema
wenv --schema schema.json --validate

# Generate example file
wenv --generate-example --example-output .env.example
```

### Security Features

```bash
# Encrypt a value
wenv --encrypt "my-secret-key"

# Decrypt a value
wenv --decrypt "encrypted:value"

# Run security audit
wenv --audit
```

### File Operations

```bash
# Compare two env files
wenv --diff .env.production

# Merge env files
wenv --merge .env.local

# Create lock file
wenv --lock
```

### Templates

```bash
# Save current env as template
wenv --template-save production

# Apply a template
wenv --template production

# List templates
wenv --template-list

# Delete a template
wenv --template-delete staging
```

### Type Generation

```bash
# Generate TypeScript types
wenv --generate-types ./src/env.d.ts
```

## 📚 CLI Options

| Option | Description |
|--------|-------------|
| `--env <name>` | Override NODE_ENV |
| `--no-expand` | Disable variable expansion |
| `--override` | Write values into `process.env` |
| `--output <json\|dotenv>` | Output format (default: json) |
| `--schema <path>` | Path to JSON schema file |
| `--validate` | Validate against schema |
| `--generate-example` | Generate `.env.example` |
| `--example-output <path>` | Custom example output path |
| `--encrypt <key>` | Encrypt a value |
| `--decrypt <value>` | Decrypt a value |
| `--audit` | Run security audit |
| `--diff <file>` | Compare with another env file |
| `--merge <file>` | Merge with another env file |
| `--template <name>` | Apply a saved template |
| `--template-list` | List available templates |
| `--template-save <name>` | Save current env as template |
| `--template-delete <name>` | Delete a template |
| `--generate-types <path>` | Generate TypeScript types |
| `--completion <shell>` | Generate shell completions |
| `--migrate <up\|down\|status>` | Run migrations |
| `--lock` | Create/update lock file |
| `--lock-check` | Verify lock file |
| `--web` | Start web UI |

## 📋 Schema Format

```json
{
  "type": "object",
  "properties": {
    "DATABASE_URL": {
      "type": "string",
      "description": "Database connection URL"
    },
    "API_KEY": {
      "type": "string",
      "minLength": 32,
      "description": "API key for external service"
    },
    "DEBUG": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["DATABASE_URL", "API_KEY"]
}
```

## 🔧 Programmatic API

```typescript
import { createEnvManager } from "@wpackages/env-manager";

const manager = createEnvManager({
  paths: [".env", ".env.local"],
  environment: "development",
  expand: true,
  override: false,
});

const result = manager.load();

if (result._tag === "Success") {
  const env = manager.getAll();
  console.log(env.DATABASE_URL);
}
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run development
bun run dev

# Run tests
bun run test

# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Full verification
bun run verify
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Run development mode |
| `watch` | Watch mode for development |
| `build` | Build with tsdown |
| `test` | Run tests with Vitest |
| `test:coverage` | Run tests with coverage |
| `lint` | Type check and lint |
| `format` | Format code with dprint |
| `audit` | Run bun audit |
| `verify` | Run all checks |

## 📄 License

MIT