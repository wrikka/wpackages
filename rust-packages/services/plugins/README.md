# Plugin Registry

Plugin registry service for WAI Command Palette.

## Features

- REST API for plugin management
- SQLite database with migrations
- Plugin search with filters
- Version management
- Rating system
- Download tracking
- CORS support
- Structured logging with tracing
- Sentry integration (optional)

## Installation

```bash
cargo build --release
```

## Configuration

Environment variables:

- `SERVER_HOST` - Server host (default: `127.0.0.1`)
- `SERVER_PORT` - Server port (default: `8080`)
- `DATABASE_URL` - Database URL (default: `sqlite:./plugins.db`)
- `DB_MAX_CONNECTIONS` - Max database connections (default: `10`)
- `ENVIRONMENT` - Environment (default: `development`)
- `LOG_LEVEL` - Log level (default: `info`)
- `SENTRY_DSN` - Sentry DSN (optional)
- `SENTRY_SAMPLE_RATE` - Sentry sample rate (default: `1.0`)
- `SENTRY_TRACES_SAMPLE_RATE` - Sentry traces sample rate (default: `0.1`)

## Usage

### Start the server

```bash
cargo run
```

### API Endpoints

#### Health Check
```
GET /health
```

#### List Plugins
```
GET /api/plugins?limit=20&offset=0
```

#### Search Plugins
```
GET /api/plugins/search?query=calculator&category=tools&author=john&keywords[]=math&limit=20&offset=0
```

#### Get Plugin
```
GET /api/plugins/:id
```

#### Create Plugin
```
POST /api/plugins
Content-Type: application/json

{
  "name": "my-plugin",
  "description": "My awesome plugin",
  "author": "John Doe",
  "repository": "https://github.com/john/my-plugin",
  "homepage": "https://example.com",
  "license": "MIT",
  "keywords": ["tool", "utility"],
  "category": "tools"
}
```

#### Delete Plugin
```
DELETE /api/plugins/:id
```

#### Get Plugin Versions
```
GET /api/plugins/:id/versions
```

#### Create Version
```
POST /api/plugins/:id/versions
Content-Type: application/json

{
  "version": "1.0.0",
  "download_url": "https://cdn.example.com/plugins/my-plugin-1.0.0.tgz",
  "checksum": "sha256:abc123...",
  "file_size": 1024,
  "min_compatible_version": "0.1.0",
  "max_compatible_version": "2.0.0"
}
```

#### Get Latest Version
```
GET /api/plugins/:id/versions/latest
```

#### Get Plugin Ratings
```
GET /api/plugins/:id/ratings
```

#### Create Rating
```
POST /api/plugins/:id/ratings?user_id=user123
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great plugin!"
}
```

#### Increment Downloads
```
POST /api/plugins/:id/download
```

#### Get Stats
```
GET /api/stats
```

## Database Migrations

Migrations are automatically run on startup. To run migrations manually:

```bash
sqlx migrate run --database-url sqlite:./plugins.db
```

## Development

```bash
# Run with hot reload
cargo watch -x run

# Run tests
cargo test

# Format code
cargo fmt

# Lint
cargo clippy
```

## License

MIT
