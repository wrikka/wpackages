# API Documentation

This document provides an overview of the public API for `@wpackages/generate`.

## Core Functions & Classes

### `generateCode(name, template, options)`

Generates a single file from a template string.

- **`name`**: `string` - The name of the entity to generate (e.g., "MyComponent").
- **`template`**: `string` - The template content.
- **`options`**: `GenerateOptions` - Configuration options.

### `Generator` class

Base class for creating custom generators. It handles template rendering, path resolution, and file writing.

### `BatchGenerator` class

A utility for running multiple generators in series or parallel.

## Specialized Generators

### `generateComponent(name, options)`

Generates a component file and an optional test file.

- **`name`**: `string` - The component name.
- **`options`**: `GenerateComponentOptions` - Includes framework (`react`, `vue`), `withTest`, `outputDir`, etc.

### `generateModule(name, options)`

Generates a module with specified sub-components (e.g., controller, service, resolver).

- **`name`**: `string` - The module name.
- **`options`**: `GenerateModuleOptions` - Configuration for module parts.

## Utility Functions

### `renderTemplate(template, variables)`

Renders a template string with the given variables and helpers.

### `convertToCase(caseType, text)`

Converts a string to a specified case (`pascal`, `camel`, `kebab`, etc.).
