# @wpackages/ports

Port registry + port availability helper.

## Install

```bash
bun add @wpackages/ports
```

## Usage

```ts
import { createPortService } from "@wpackages/ports";

const ports = createPortService();

const port = await ports.findAvailablePort(3000);
const info = ports.registerPort(port);

console.log(info.url);
```

## API

- `createPortService()`
- `PortService`
  - `registerPort(port, hostname?)`
  - `unregisterPort(port)`
  - `getPort(port)`
  - `getAllPorts()`
  - `getOpenPorts()`
  - `isPortOpen(port)`
  - `findAvailablePort(startPort?)`
  - `clear()`

## Development

```bash
bun run format
bun run lint
bun run test
bun run test:coverage
bun run build
```
