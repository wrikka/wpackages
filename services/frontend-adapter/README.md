# Frontend Adapter

A universal component adapter. Write once in TypeScript, and compile to Vue, React, and Svelte.

## Usage

```ts
import { compile } from './src/compile';
import { el, text } from './src/types/ir';

const tree = el('div', { class: 'container' }, [
  el('h1', {}, [text('Hello')]),
  el('p', {}, [text('Write once')]),
]);

console.log(compile('react', tree));
console.log(compile('vue', tree));
console.log(compile('svelte', tree));
```

## Scripts

```bash
bun run lint
bun run test
bun run build
bun run verify
```

## Example

```bash
bun run examples/basic.ts
```
