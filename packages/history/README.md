# @wpackages/history

A library for managing session history in JavaScript applications.

## Installation

This is an internal package and does not require installation from an external registry.

## Basic Usage

### Browser History

For most use cases, you can import the singleton browser history instance.

```typescript
import history from "@wpackages/history/browser";
```

If you need to create your own instance (e.g., for an iframe), you can use the factory function:

```typescript
import { createBrowserHistory } from "@wpackages/history";

const history = createBrowserHistory();

// Get the current location.
const location = history.location;

// Listen for changes to the current location.
const unlisten = history.listen(({ location, action }) => {
	console.log(action, location.pathname, location.state);
});

// Use push to push a new entry onto the history stack.
history.push("/home", { some: "state" });

// To stop listening, call the function returned from listen().
unlisten();
```

### Hash History

For most use cases, you can import the singleton hash history instance.

```typescript
import history from "@wpackages/history/hash";
```

If you need to create your own instance, you can use the factory function:

```typescript
import { createHashHistory } from "@wpackages/history";

const history = createHashHistory();
```

### Memory History

```typescript
import { createMemoryHistory } from "@wpackages/history";

const history = createMemoryHistory();
```

## API

### `history` object

- `location`: The current location.
- `action`: The current navigation action (`PUSH`, `REPLACE`, or `POP`).
- `push(path, [state])`: Pushes a new entry onto the history stack.
- `replace(path, [state])`: Replaces the current entry on the history stack.
- `go(delta)`: Navigates `delta` entries through the history stack.
- `back()`: Navigates one entry back in the history stack.
- `forward()`: Navigates one entry forward in the history stack.
- `listen(listener)`: Subscribes a listener to history changes.
