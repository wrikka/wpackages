# generate

> Powerful code generation library with template engine for scaffolding, components, modules, tests, and documentation

## 📦 Installation

```bash
bun add generate
```

## 🚀 Quick Start

```typescript
import { createCodeGenerator, createComponentGenerator } from 'generate'

// Generate a TypeScript file
const codeGen = createCodeGenerator('user-service', undefined, {
	outputDir: './src/services',
	variables: {
		name: 'UserService',
		description: 'Service for managing users'
	}
})
await codeGen.generate()

// Generate a React component
const componentGen = createComponentGenerator('UserProfile', {
	outputDir: './src/components',
	framework: 'react',
	withTest: true,
	withUsage: true,
	variables: {
		name: 'UserProfile',
		description: 'User profile component'
	}
})
await componentGen.generate()
```

## ✨ Features

- 🎨 **Template Engine** - Powerful variable substitution and helper functions
- 🧩 **Multiple Generators** - Code, Component, Module, Test generators
- 🔄 **Case Conversion** - PascalCase, camelCase, kebab-case, snake_case, CONSTANT_CASE
- 📝 **Built-in Templates** - Ready-to-use templates for React, Vue, TypeScript
- ⚡ **Functional Architecture** - Pure functions, immutable data
- 🎯 **Type-safe** - Full TypeScript support
- 🔌 **Extensible** - Easy to create custom generators
- 📦 **Zero Dependencies** - Uses only file-system

## 📚 Generators

### CodeGenerator

Generate TypeScript/JavaScript files from templates.

```typescript
import { createCodeGenerator } from 'generate'

const generator = createCodeGenerator('my-function', customTemplate, {
	outputDir: './src/utils',
	caseStyle: 'kebab',
	variables: {
		name: 'myFunction',
		description: 'My custom function'
	}
})

const result = await generator.generate()
```

### ComponentGenerator

Generate React or Vue components with optional test and usage files.

```typescript
import { createComponentGenerator } from 'generate'

const generator = createComponentGenerator('Button', {
	outputDir: './src/components',
	framework: 'react', // or 'vue'
	withTest: true,
	withUsage: true,
	variables: {
		name: 'Button',
		description: 'Reusable button component'
	}
})

const result = await generator.generate()
```

### ModuleGenerator

Generate complete module structure with test, usage, and index files.

```typescript
import { createModuleGenerator } from 'generate'

const generator = createModuleGenerator('auth', {
	outputDir: './src',
	withTests: true,
	withUsage: true,
	withIndex: true,
	variables: {
		name: 'auth',
		description: 'Authentication module'
	}
})

const result = await generator.generate()
```

### TestGenerator

Generate test files for existing code.

```typescript
import { createTestGenerator } from 'generate'

const generator = createTestGenerator('user-service', undefined, {
	outputDir: './src/services',
	variables: {
		name: 'userService'
	}
})

const result = await generator.generate()
```

## 🎨 Template System

### Variable Substitution

```typescript
const template = `
export const {{ camel name }} = () => {
  // {{ description }}
  return "Hello {{ name }}"
}
`
```

### Helper Functions

- **{{ pascal name }}** - Convert to PascalCase
- **{{ camel name }}** - Convert to camelCase
- **{{ kebab name }}** - Convert to kebab-case
- **{{ snake name }}** - Convert to snake_case
- **{{ constant name }}** - Convert to CONSTANT_CASE
- **{{ plural name }}** - Pluralize word
- **{{ singular name }}** - Singularize word

### Custom Templates

```typescript
const customTemplate = `
/**
 * {{ description }}
 */
export interface {{ pascal name }}Props {
  id: string
  name: string
}

export const {{ camel name }} = (props: {{ pascal name }}Props) => {
  console.log(props)
}
`

const generator = createCodeGenerator('user', customTemplate, {
	outputDir: './src',
	variables: {
		name: 'User',
		description: 'User interface and function'
	}
})
```

## 🛠️ Utilities

### Case Conversion

```typescript
import {
	toPascalCase,
	toCamelCase,
	toKebabCase,
	toSnakeCase,
	toConstantCase,
	convertCase
} from 'generate'

toPascalCase('hello world') // "HelloWorld"
toCamelCase('hello world') // "helloWorld"
toKebabCase('HelloWorld') // "hello-world"
toSnakeCase('HelloWorld') // "hello_world"
toConstantCase('hello world') // "HELLO_WORLD"

convertCase('hello world', 'pascal') // "HelloWorld"
```

### Template Rendering

```typescript
import { renderTemplate, createTemplateHelpers } from 'generate'

const template = "{{ pascal name }}"
const context = {
	variables: { name: 'hello world' },
	helpers: createTemplateHelpers()
}

renderTemplate(template, context) // "HelloWorld"
```

### Path Resolution

```typescript
import { resolveOutputPath, resolveDirectoryPath } from 'generate'

resolveOutputPath('./src', 'UserProfile', 'kebab', '.tsx')
// "./src/user-profile.tsx"

resolveDirectoryPath('./src', 'components', 'ui')
// "./src/components/ui"
```

## 🎯 Options

```typescript
interface GeneratorOptions {
	/** Output directory path */
	outputDir: string
	/** Whether to overwrite existing files (default: false) */
	overwrite?: boolean
	/** Whether to format generated files (default: true) */
	format?: boolean
	/** Custom template variables */
	variables?: Record<string, unknown>
	/** File name case style (default: 'kebab') */
	caseStyle?: 'pascal' | 'camel' | 'kebab' | 'snake' | 'constant'
	/** Dry run mode - don't write files (default: false) */
	dryRun?: boolean
}
```

## 🏗️ Custom Generators

Extend `BaseGenerator` to create your own generators:

```typescript
import { BaseGenerator } from 'generate'

class CustomGenerator extends BaseGenerator {
	protected async getFilesToGenerate() {
		return [
			{
				path: './output/custom.ts',
				content: this.renderTemplate('{{ pascal name }}')
			}
		]
	}
}

const generator = new CustomGenerator({
	outputDir: './src',
	variables: { name: 'MyCustom' }
})

await generator.generate()
```

## 🎯 Advanced Features

### Functional Generators (New)

Generate files using pure functions instead of classes:

```typescript
import { generateCode, generateComponent, generateModule, generateTest } from 'generate'

// Generate code file
const codeResult = await generateCode('my-function', undefined, {
	outputDir: './src/utils',
	variables: { name: 'myFunction' }
})

// Generate component
const componentResult = await generateComponent('Button', {
	outputDir: './src/components',
	framework: 'react',
	withTest: true,
	withUsage: true,
	variables: { name: 'Button' }
})

// Generate module
const moduleResult = await generateModule('auth', {
	outputDir: './src',
	withTests: true,
	withUsage: true,
	withIndex: true,
	variables: { name: 'auth' }
})

// Generate test
const testResult = await generateTest('user-service', undefined, {
	outputDir: './src/services',
	variables: { name: 'userService' }
})
```

### Batch Generation

Generate multiple files efficiently:

```typescript
import { generateBatch, generateBatchParallel } from 'generate'

// Sequential batch generation
const result = await generateBatch([
	{
		path: './src/services/user.service.ts',
		content: 'export const userService = () => {}'
	},
	{
		path: './src/services/auth.service.ts',
		content: 'export const authService = () => {}'
	}
], {
	outputDir: './src',
	overwrite: true
})

// Parallel batch generation (5 concurrent files)
const parallelResult = await generateBatchParallel(
	files,
	{ outputDir: './src' },
	5 // concurrency
)
```

### Template Validation

Validate templates before generation:

```typescript
import { validateTemplateWithDefaults, assertTemplateValid } from 'generate'

// Validate and get detailed results
const result = validateTemplateWithDefaults(
	'{{ pascal name }} - {{ description }}',
	{ name: 'User', description: 'User service' }
)

console.log(result.valid) // true
console.log(result.missingVariables) // []
console.log(result.invalidHelpers) // []

// Assert template is valid (throws on error)
try {
	assertTemplateValid(template, context)
	console.log('Template is valid!')
} catch (error) {
	console.error('Template validation failed:', error)
}
```

### Preset Generators

Generate common patterns quickly:

```typescript
import { generateFromPreset, PRESETS } from 'generate'

// React component with test and usage
await generateFromPreset(PRESETS.REACT_COMPONENT, {
	outputDir: './src/components',
	variables: { name: 'Button' }
})

// Vue component
await generateFromPreset(PRESETS.VUE_COMPONENT, {
	outputDir: './src/components',
	variables: { name: 'Card' }
})

// Full module structure
await generateFromPreset(PRESETS.FULL_MODULE, {
	outputDir: './src',
	variables: { name: 'auth' }
})

// Service layer
await generateFromPreset(PRESETS.SERVICE_LAYER, {
	outputDir: './src/services',
	variables: { name: 'UserService' }
})

// Custom preset
const customPreset = {
	name: 'Custom API',
	description: 'API endpoint with handler and test',
	files: [
		{ type: 'code', name: 'handler' },
		{ type: 'test', name: 'handler' }
	]
}

await generateFromPreset(customPreset, {
	variables: { name: 'getUser' }
})
```

## 🛠️ Development

```bash
# Build
bun build

# Development mode
bun dev

# Run linter
bun lint

# Format code
bun format

# Run tests
bun test

# Full review
bun review
```

## 📄 License

MIT
