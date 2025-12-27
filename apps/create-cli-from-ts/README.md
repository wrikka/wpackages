# build-cli

CLI builder utilities for creating command-line interfaces.

## Features

- 🚀 Fast CLI creation
- 📦 Zero dependencies core
- 🎨 Beautiful output formatting
- ⚡ TypeScript first

## Installation

```bash
bun add build-cli
```

## Usage

```typescript
import { createCLI } from 'build-cli';

const cli = createCLI({
  name: 'my-cli',
  version: '1.0.0',
  description: 'My awesome CLI tool',
});

cli.command('hello', 'Say hello', () => {
  console.log('Hello, world!');
});

cli.parse();
```

## License

MIT
