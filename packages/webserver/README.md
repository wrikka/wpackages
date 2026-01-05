# @wpackages/webserver

## Overview

Production-ready HTTP server built on `@effect/platform` + Bun.

## Features

- Health checks: `GET /healthz`, `GET /readyz`
- API key auth (scoped to `/users/*` via `x-api-key`)
- Rate limiting (scoped to `/users/*`)
- Security headers (default baseline on all built-in responses)
- Body size limit (`MAX_BODY_BYTES`)
- Metrics: `GET /metrics` (Prometheus text format)
- OpenAPI spec: `GET /openapi.json`
- Graceful shutdown on `SIGINT` / `SIGTERM`

## Install

From monorepo root:

```bash
bun install
```

## Run

```bash
bun run src/index.ts
```

## Environment Variables

- `PORT` (number)
- `API_KEY` (string, optional)
- `RATE_LIMIT_MAX` (number)
- `RATE_LIMIT_WINDOW_MS` (number)
- `CORS_ALLOWED_ORIGINS` (comma-separated, optional)
- `MAX_BODY_BYTES` (number)
- `PAYLOAD_BYTES` (number)
- `DATABASE_URL` (string, optional)
- `TEST_MODE` ("1" to enable in-memory test data)

## Endpoints

- `GET /` -> `Hello World`
- `GET /healthz` -> `{ ok: true }`
- `GET /readyz` -> `{ ready: boolean, db: "ok" | "disabled" | "error" }`
- `GET /users/:id`
  - 200 -> `{ user: { id: number, name: string } }`
  - 404 -> `User not found`
  - 401 -> `Unauthorized` (when `API_KEY` is set and header missing/invalid)
- `GET /metrics` -> Prometheus metrics
- `GET /openapi.json` -> OpenAPI 3.0 spec
- `GET /docs` -> HTML docs

## Examples

### Health

```bash
curl http://localhost:3000/healthz
```

### User

```bash
curl -H "x-api-key: $API_KEY" http://localhost:3000/users/1
```

### Metrics

```bash
curl http://localhost:3000/metrics
```

## Development

```bash
bun run verify
```
