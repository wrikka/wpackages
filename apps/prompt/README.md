# @wrikka/prompt

An elegant and feature-rich command-line prompt library, built with Ink.js and React, inspired by `@clack/prompts` but with 3x more components and a focus on superior UX/UI.

## Features

- **Modern Stack**: Built with Ink.js and React for a declarative, component-based UI.
- **Rich Component Library**: Over 10 interactive components out-of-the-box.
- **Themable**: Easily customize colors and styles (coming soon).
- **Developer Friendly**: Simple, promise-based API.

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

## Usage

```tsx
import React from 'react';
import { prompt } from '@wrikka/prompt';
import { TextPrompt } from '@wrikka/prompt';

async function main() {
  const name = await prompt(
    TextPrompt,
    { message: 'What is your name?', placeholder: 'Type here...' },
    ''
  );
  console.log(`Hello, ${name}!`);
}

main();
```

## Run the Showcase

To see all components in action, run:

```bash
bun run showcase