# Websearch UI (Vite + Vue)

## Dev

```bash
bun install
bun run dev
```

## Config

- `VITE_API_BASE_URL` : base URL ของ backend (เช่น `http://localhost:3000`)
- `VITE_DEV_PROXY_TARGET` : target สำหรับ vite dev proxy ของ `/api` (default `http://localhost:3000`)

SSE endpoint ที่ใช้:

- `GET /api/search/stream?q=...`
