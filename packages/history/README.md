# @wpackages/history

A modern, lightweight, and dependency-free library for managing session history in JavaScript applications. It provides a minimal, consistent API that works across different environments: browser, hash, and in-memory.

This library is heavily inspired by the popular `history` package from Remix.

## Features

- ✅ **Minimal API**: Simple and intuitive API for managing history (`push`, `replace`, `go`, `listen`).
-  môi trường **Multiple Environments**: Supports browser history (HTML5 API), hash history, and in-memory history.
- 🚀 **Singleton Exports**: Provides singleton instances for browser and hash history for quick and easy setup.
- 🖼️ **iFrame Support**: Allows passing a custom `window` object, making it suitable for use in iFrames.
- 🔒 **Type-Safe**: Written in TypeScript with a type-safe `Action` enum.

## Installation

This is an internal package within the `wpackages` monorepo and is not published to an external registry.

## Usage

### Browser History

Uses the HTML5 History API to keep your UI in sync with the URL.

**Singleton Instance (Recommended)**

For most web applications, you can import the pre-configured singleton instance.

```typescript
import history from '@wpackages/history/browser';

history.push('/home');
```

**Factory Function**

If you need to manage history for a specific `window` (like an iFrame), use the factory function.

```typescript
import { createBrowserHistory } from '@wpackages/history';

const history = createBrowserHistory({ window: myIframe.contentWindow });
history.push('/profile');
```

### Hash History

Uses the hash (`#`) portion of the URL, suitable for older browsers or static file servers.

**Singleton Instance (Recommended)**

```typescript
import history from '@wpackages/history/hash';

history.push('/settings'); // URL becomes /#/settings
```

**Factory Function**

```typescript
import { createHashHistory } from '@wpackages/history';

const history = createHashHistory();
history.push('/dashboard');
```

### Memory History

Useful for testing and non-browser environments (like React Native). It stores the history stack in an array in memory.

```typescript
import { createMemoryHistory } from '@wpackages/history';

const history = createMemoryHistory({ initialEntries: ['/login'] });

console.log(history.location.pathname); // -> /login
console.log(history.index); // -> 0

history.push('/dashboard');
console.log(history.index); // -> 1
```

## API Reference

### `history` Object

All history objects share the following properties and methods:

- `location: Location`: The current location object.
- `action: Action`: The last action (`Action.Push`, `Action.Replace`, or `Action.Pop`).
- `index?: number`: (Memory History only) The current index in the history stack.
- `push(path: string, state?: unknown)`: Pushes a new entry onto the history stack.
- `replace(path: string, state?: unknown)`: Replaces the current entry on the history stack.
- `go(delta: number)`: Navigates `delta` entries forward or backward.
- `back()`: Equivalent to `go(-1)`.
- `forward()`: Equivalent to `go(1)`.
- `listen(listener: Listener): () => void`: Subscribes to location changes. Returns a function to unsubscribe.

### Core Utilities

- `createHistory(source: HistorySource): History`: The core factory for creating custom history objects.
- `createPath(pathParts: PathParts): string`: Builds a URL path string from its parts.
- `parsePath(path: string): ParsedPath`: Parses a URL path string into its component parts.
