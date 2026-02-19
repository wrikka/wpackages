# MCP Library

## Introduction

Model Context Protocol (MCP) implementation for wterminal with WebSocket transport. This library provides full MCP protocol support, enabling communication between AI models and external tools through a standardized protocol.

## Features

- 📡 **MCP Protocol** - Full MCP protocol support
- 🌐 **WebSocket Transport** - Real-time communication
- 🔄 **JSON-RPC** - Request/response handling
- ✅ **Schema Validation** - Validate messages
- 🔌 **Easy Integration** - Simple API

## Goal

- 🎯 Provide MCP protocol implementation for wterminal IDE
- 📡 Enable real-time communication
- 🔄 Support JSON-RPC messaging
- ✅ Ensure message validity

## Design Principles

- 📡 **Standard-compliant** - Follow MCP specification
- 🌐 **Real-time** - WebSocket-based communication
- 🔄 **Reliable** - Robust message handling
- ✅ **Validated** - Schema validation

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
mcp = { path = "../mcp" }
```

## Usage

### Server Setup

```rust
use mcp::{McpServer, McpConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = McpConfig::builder()
        .address("0.0.0.0:8080")
        .build();
    
    let server = McpServer::new(config)?;
    server.start().await?;
    
    Ok(())
}
```

## Examples

### Client Connection

```rust
use mcp::{McpClient, McpClientConfig};

let config = McpClientConfig::builder()
    .url("ws://localhost:8080")
    .build();

let client = McpClient::connect(config).await?;

// Send request
let response = client.send_request("method", params).await?;
```

## Server

```rust
use mcp::{McpServer, McpConfig};

let config = McpConfig::builder()
    .address("0.0.0.0:8080")
    .enable_tls(false)
    .build();

let server = McpServer::new(config)?;
server.start().await?;
```

## Client

```rust
use mcp::{McpClient, McpClientConfig};

let config = McpClientConfig::builder()
    .url("ws://localhost:8080")
    .build();

let client = McpClient::connect(config).await?;

// Send request
let response = client.send_request("method", params).await?;
```

## Schema Validation

```rust
use mcp::schema::validate_message;

let message = serde_json::json!({
    "jsonrpc": "2.0",
    "method": "test",
    "params": {}
});

let is_valid = validate_message(&message)?;
```

## Development

```bash
cargo build
cargo test
```

## License

MIT
