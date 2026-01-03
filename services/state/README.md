# WAI Reactive TUI (`@wai/reactive-tui`)

A blazing fast, functional, and type-safe library for building interactive command-line apps, powered by Effect-TS.

## Introduction

`@wai/reactive-tui` is a library for building interactive command-line apps. It's heavily inspired by the component-based model of React and Ink, but with a strong emphasis on functional programming and type safety provided by the `Effect-TS` ecosystem. It allows you to build your TUI using declarative, component-based APIs.

## Design Principles

- **Functional & Type-Safe**: By leveraging `Effect-TS`, we can build robust applications where side effects are managed explicitly, leading to more predictable and testable code.
- **Component-Driven**: Structure your application into reusable, composable components. The library provides basic building blocks like `<Box>` and `<Text>` that you can combine to create complex UIs.
- **Performance First**: Designed to be lightweight and fast, leveraging modern runtimes like Bun for optimal performance.

## Installation

Install the package using your preferred package manager:

```bash
bun add @wai/reactive-tui
```

## Usage

The library provides a `render` function that takes a virtual node (created by components like `Box` and `Text`) and returns an `Effect` program. You can then run this program to render your UI to the terminal.

The core building blocks are components, which are functions that return a description of the UI.

### 1. Define your UI with Components

Create a component that returns a tree of elements. The primary layout component is `<Box>`, which uses a flexbox-like model for positioning children. `<Text>` is used to render text content.

```typescript
import { Box, Text } from "@wai/reactive-tui";

const App = () =>
	Box({ flexDirection: "column", padding: { top: 1, left: 2 } }, [
		Text({ color: "green", bold: true }, "Hello from reactive-tui!"),
		Text({ italic: true }, "Powered by Effect-TS."),
	]);
```

### 2. Render the UI

Use the `render` function to create an `Effect` program from your root component. Then, use `Effect.runPromise` (or any other Effect runner) to execute the program and render the UI to the console.

```typescript
import { render } from "@wai/reactive-tui";
import { Effect } from "effect";

// The render function returns an Effect
const program = render(App());

// Run the Effect to render the UI
Effect.runPromise(program);
```

## API Reference

### `<Box {...props}>`

A layout component based on Flexbox.

**Layout Props:**

- `flexDirection`: `"row"` | `"column"` | `"row-reverse"` | `"column-reverse"`
- `justifyContent`: `"flex-start"` | `"center"` | `"flex-end"` | `"space-between"` | `"space-around"`
- `alignItems`: `"flex-start"` | `"center"` | `"flex-end"` | `"stretch"`
- `width`: `number` | `string`
- `height`: `number` | `string`
- `flexGrow`: `number`

**Styling Props:**

- `padding`: `{ top?: number, bottom?: number, left?: number, right?: number }`
- `borderStyle`: `"single"` | `"double"` | `"round"` | ... (and other common border styles)
- `borderColor`: A color name like `"red"`, `"green"`, `"blue"`, etc.

### `<Text {...props}>`

A component for rendering text.

**Styling Props:**

- `color`: A color name like `"red"`, `"green"`, `"blue"`, etc.
- `bold`: `boolean`
- `italic`: `boolean`

## Examples

Here is a more advanced example demonstrating layout and styling:

```typescript
import { Box, render, Text } from "@wai/reactive-tui";
import { Effect } from "effect";

const App = () =>
	Box(
		{
			flexDirection: "column",
			padding: { left: 2, right: 2 },
			borderStyle: "round",
			borderColor: "blue",
		},
		[
			Text({ bold: true, color: "yellow" }, "WAI Reactive TUI"),
			Box({ flexDirection: "row", justifyContent: "space-between" }, [
				Text({ color: "cyan" }, "Item 1"),
				Text({ color: "magenta" }, "Item 2"),
			]),
		],
	);

const program = render(App());
Effect.runPromise(program);
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
