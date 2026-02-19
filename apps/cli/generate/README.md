# @wpackages/generate

Powerful code generation library with template engine for scaffolding, components, modules, tests, and documentation

## Overview

`@wpackages/generate` is a comprehensive code generation tool that helps developers quickly create boilerplate code, components, modules, tests, and documentation through customizable templates. Built with TypeScript and designed for extensibility, it streamlines the development workflow by automating repetitive coding tasks.

## Features

- 🚀 **Template Engine**: Powerful template system with variable substitution and conditional logic
- 📝 **Multiple Generators**: Support for components, modules, tests, documentation, and more
- 🎨 **Customizable Templates**: Create and modify templates to fit your project needs
- ⚡ **Fast Generation**: Optimized for speed with Bun runtime
- 🔧 **CLI Integration**: Easy-to-use command-line interface
- 📦 **Type-Safe**: Full TypeScript support with type definitions
- 🧪 **Test Ready**: Generate tests alongside your code
- 📚 **Documentation**: Auto-generate documentation for generated code

## Installation

```bash
bun install @wpackages/generate
```

## Usage

### CLI Usage

```bash
# Generate a new component
bunx @wpackages/generate component MyComponent

# Generate a module with tests
bunx @wpackages/generate module MyModule --with-tests

# Generate documentation
bunx @wpackages/generate docs --source ./src

# List available generators
bunx @wpackages/generate --list
```

### Programmatic Usage

```typescript
import { Generator } from '@wpackages/generate';

const generator = new Generator({
  templates: './templates',
  output: './src'
});

// Generate a component
await generator.generate('component', {
  name: 'MyComponent',
  type: 'functional',
  withTests: true,
  withStorybook: false
});

// Generate a module
await generator.generate('module', {
  name: 'UserModule',
  exports: ['UserService', 'UserTypes'],
  withTests: true
});
```

## Available Generators

### Component Generator
Creates reusable components with optional tests and stories:

```bash
bunx @wpackages/generate component ComponentName [options]
```

Options:
- `--type`: Component type (functional, class, hooks)
- `--with-tests`: Generate test files
- `--with-storybook`: Generate Storybook stories
- `--styled`: Include styled components

### Module Generator
Creates complete modules with exports and dependencies:

```bash
bunx @wpackages/generate module ModuleName [options]
```

Options:
- `--with-tests`: Generate test files
- `--with-docs`: Generate documentation
- `--exports`: Comma-separated list of exports

### Test Generator
Generates test files for existing code:

```bash
bunx @wpackages/generate test ./path/to/file.ts
```

### Documentation Generator
Creates documentation from code comments:

```bash
bunx @wpackages/generate docs --source ./src --output ./docs
```

## Configuration

Create a `generate.config.json` file in your project root:

```json
{
  "templates": "./custom-templates",
  "output": "./src",
  "generators": {
    "component": {
      "template": "component.ts.hbs",
      "testTemplate": "component.test.ts.hbs",
      "output": "./components"
    },
    "module": {
      "template": "module.ts.hbs",
      "indexTemplate": "index.ts.hbs",
      "output": "./modules"
    }
  },
  "variables": {
    "author": "Your Name",
    "license": "MIT"
  }
}
```

## Custom Templates

Create custom templates using Handlebars syntax:

```handlebars
// templates/component.ts.hbs
export interface {{name}}Props {
  {{#each props}}
  {{name}}: {{type}};
  {{/each}}
}

export const {{name}}: React.FC<{{name}}Props> = ({{destructuredProps}}) => {
  return (
    <div className="{{kebabCase name}}">
      {{!-- Component content --}}
    </div>
  );
};
```

## Development

```bash
bun run build
bun run test
```

## Available Scripts

- `build`: tsdown --exports --dts --minify
- `dev`: tsdown --watch
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `verify`: bun format && bun lint && bun test
- `test`: vitest
- `watch`: bun --watch src/index.ts

## License

MIT