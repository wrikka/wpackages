  # wserver

A Vite plugin for creating a powerful, feature-rich development server with API routing, WebSockets, authentication, and more, built with a functional approach.

## Features

-   **API Routing**: Dynamically loads API routes from a specified directory.
-   **WebSocket Server**: Integrated WebSocket server for real-time communication.
-   **Authentication**: Pluggable authentication middleware (JWT example included).
-   **Scheduled Tasks**: Cron job support for background tasks.
-   **Data Storage**: Flexible data storage options (e.g., in-memory, Redis).
-   **Database Connections**: Support for multiple database connections.

## Design Principles

- **Modular and Extensible** 🧩: Built with a modular architecture, allowing you to easily enable, disable, or extend features.
- **Developer-First** 🧑‍💻: Focused on providing a seamless and productive developer experience.
- **Performant** ⚡️: Uses the fast `h3` server engine and efficient WebSocket handling.

## Installation

| npm | pnpm | yarn | bun |
| --- | --- | --- | --- |
| `npm install wserver -D` | `pnpm add wserver -D` | `yarn add wserver -D` | `bun add wserver -D` |

## Usage

Import and use the plugin in your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import wserver from 'wserver';

export default defineConfig({
  plugins: [
    wserver({
      // Your options here
    }),
  ],
});
```

## Configuration

The `wserver` plugin accepts a configuration object to enable and customize its features. See `vite.config.ts` for a detailed example.

## License

MIT
