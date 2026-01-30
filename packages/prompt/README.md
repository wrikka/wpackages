# @wpackages/prompt

## Introduction

`@wpackages/prompt` is an elegant and feature-rich command-line prompt library for creating beautiful and intuitive interactive experiences. It is built with **Ink.js** and **React**, allowing for a declarative, component-based approach to terminal UI. Inspired by the simplicity of `@clack/prompts`, this library expands on its foundation with a significantly larger component library and a strong focus on superior user experience.

## Features

- ⚛️ **Modern Stack**: Built with Ink.js and React for a declarative, component-based UI.
- 🧩 **Extensive Component Library**: Offers a wide range of interactive components, from simple text inputs to complex date pickers.
- 💅 **Beautifully Designed**: A focus on aesthetics and usability to provide a polished user experience.
- 🧑‍💻 **Developer Friendly**: A simple, promise-based API that is easy to integrate into any CLI application.
- 🎨 **Themable**: Easily customize colors, symbols, and styles to match your brand.

## Goal

- 🎯 **Best-in-Class UX**: To provide the best possible user experience for interactive command-line prompts.
- ✨ **Rich Interactivity**: To empower developers to build CLIs that are as intuitive and easy to use as graphical applications.
- 🧩 **Comprehensive Solution**: To be the go-to library for any type of user input required in a CLI.

## Design Principles

- **Declarative UI**: Leverages React's component model to define terminal UIs in a clear and predictable way.
- **Component-Based**: Every prompt is a reusable component, promoting consistency and code reuse.
- **User-Centric**: Components are designed with the end-user in mind, prioritizing clarity, feedback, and ease of use.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The library exposes a `prompt` function that takes a React component and its props, and returns a promise that resolves with the user's input.

```tsx
import { prompt, TextPrompt } from "@wpackages/prompt";

async function main() {
	const name = await prompt(
		TextPrompt,
		{
			message: "What is your name?",
			placeholder: "Type here...",
		},
	);

	if (name) {
		console.log(`Hello, ${name}!`);
	}
}

main();
```

## Components

- `TextPrompt`: For single-line text input.
- `PasswordPrompt`: For masked text input.
- `ConfirmPrompt`: For yes/no confirmations.
- `TogglePrompt`: A stylish on/off switch.
- `SelectPrompt`: For selecting a single option from a list.
- `MultiSelectPrompt`: For selecting multiple options from a list.
- `NumberPrompt`: For number input with min/max/step controls.
- `SliderPrompt`: A visual slider for selecting a number in a range.
- `RatingPrompt`: For selecting a rating (e.g., stars).
- `DatePrompt`: A calendar-based date picker.
- `TimePrompt`: A time picker.
- `Note`: For displaying styled informational messages.
- `LoadingSpinner`: An animated spinner for long-running tasks.

## Examples

### Run the Component Showcase

To see all available components in action, run the showcase from this workspace:

```bash
# Run from the monorepo root
turbo showcase --filter=@wpackages/prompt
```

## Theming

You can customize the appearance of the prompts by passing a `theme` object to the `prompt` function. The theme object can contain custom `colors` and `symbols`.

```tsx
import { confirm, prompt, text } from "@wpackages/prompt";
import picocolors from "picocolors";

async function main() {
	const customTheme = {
		colors: {
			primary: picocolors.magenta,
			message: picocolors.yellow,
		},
		symbols: {
			radioOn: ">>",
			radioOff: "  ",
		},
	};

	await prompt(
		text({ message: "What is your name?" }),
		{ theme: customTheme },
	);
}

main();
```

## License

This project is licensed under the MIT License.
