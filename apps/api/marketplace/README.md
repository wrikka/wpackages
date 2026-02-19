# Marketplace API 🛒

## Introduction

The Marketplace API is a REST API service for the wterminal extension marketplace. It provides a comprehensive interface for managing extensions, including search, creation, updates, and download tracking. Built with Rust and PostgreSQL, this API offers high-performance, type-safe operations for extension management.

The API enables developers to publish, discover, and manage extensions with features like search by category, download tracking, update checking, and comprehensive metadata management. It's designed to be the central hub for the wterminal ecosystem's extension marketplace.

## Features

- 🔍 **Search Functionality** - Search extensions by name, description, author, and category
- 📦 **Extension Management** - Create, update, and delete extensions
- 📊 **Download Tracking** - Track download counts for extensions
- 🔄 **Update Checking** - Check for updates to extensions
- 🗄️ **PostgreSQL Backend** - Reliable database storage with migrations
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🌐 **CORS Support** - Cross-origin resource sharing support
- ⚡ **High Performance** - Built with Rust for maximum speed
- 📝 **Comprehensive API** - Full CRUD operations for extensions
- 🔒 **Type Safety** - Full Rust type safety throughout

## Goals

- 🎯 Provide a comprehensive API for the wterminal extension marketplace
- 🔍 Enable efficient search and discovery of extensions
- 📦 Offer complete extension management capabilities
- 📊 Track download counts and usage statistics
- 🔄 Support extension updates and version management
- ⚡ Deliver high-performance, reliable API service
- 🔒 Ensure secure authentication and authorization
- 🌐 Enable cross-platform access with CORS support
- 📝 Provide comprehensive API documentation
- 🛡️ Build fault-tolerant, scalable API infrastructure

## Design Principles

- ⚡ **Performance First** - Built with Rust for maximum speed
- 🔒 **Security** - JWT authentication and CORS support
- 📊 **Reliability** - PostgreSQL backend with migrations
- 🎨 **Clean API** - RESTful API design with comprehensive endpoints
- 🔒 **Type Safety** - Full Rust type safety throughout
- 📝 **Well-Documented** - Comprehensive API documentation
- 🛡️ **Scalability** - Designed for high-traffic scenarios
- 🌐 **Accessibility** - CORS support for cross-platform access
- 📊 **Observability** - Built-in logging and monitoring
- 🧩 **Modularity** - Independent and reusable components

## Installation

<details>
<summary>Prerequisites</summary>

- PostgreSQL 14+
- Rust 1.70+

</details>

<details>
<summary>Install Dependencies</summary>

Install dependencies at the monorepo root:

```bash
bun install
```

</details>

<details>
<summary>Setup</summary>

1. Create a `.env` file:
```env
DATABASE_URL=postgresql://localhost/marketplace
PORT=3000
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

2. Run migrations:
```bash
sqlx migrate run
```

3. Start the server:
```bash
bun --cwd apps/marketplace-api run dev
```

</details>

## Usage

### Development Mode

```bash
bun --cwd apps/marketplace-api run dev
```

### Formatting / Linting

```bash
bun --cwd apps/marketplace-api run format
bun --cwd apps/marketplace-api run lint
```

### Testing

```bash
bun --cwd apps/marketplace-api run test
```

### Production Build

```bash
bun --cwd apps/marketplace-api run build
bun --cwd apps/marketplace-api run build:windows
bun --cwd apps/marketplace-api run build:linux
bun --cwd apps/marketplace-api run build:mac
```

### Verify

```bash
bun --cwd apps/marketplace-api run verify
```

## Examples

### Health Check

```bash
curl http://localhost:3000/health
```

### Search Extensions

```bash
curl "http://localhost:3000/extensions?q=git"
```

### Get Extension by ID

```bash
curl "http://localhost:3000/extensions/{uuid}"
```

### Create Extension

```bash
curl -X POST "http://localhost:3000/extensions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Git Extension",
    "version": "1.0.0",
    "author": "John Doe",
    "repository": "https://github.com/example/git-extension",
    "description": "Git integration for wterminal",
    "category": "git",
    "download_url": "https://example.com/download/git-extension.wasm"
  }'
```

## License

MIT
