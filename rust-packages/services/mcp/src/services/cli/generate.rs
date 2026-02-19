use std::fs;
use std::path::PathBuf;
use anyhow::Result;

pub fn generate_server_stub(name: &str, output: &PathBuf) -> Result<()> {
    let stub = format!(
        r#"use mcp::{{McpServer, McpConfig, ToolHandler, ResourceHandler}};
use serde_json::json;

struct {}Server;

impl ToolHandler for {}Server {{
    async fn call_tool(&self, name: &str, params: serde_json::Value) -> mcp::Result<serde_json::Value> {{
        match name {{
            "example_tool" => {{
                Ok(json!({{
                    "result": "Tool executed successfully"
                }}))
            }}
            _ => {{
                Err(mcp::McpError::NotFound(format!("Tool not found: {{}}", name)))
            }}
        }}
    }}
}}

impl ResourceHandler for {}Server {{
    async fn read_resource(&self, uri: &str) -> mcp::Result<String> {{
        Ok(format!("Resource content: {{}}", uri))
    }}
}}

#[tokio::main]
async fn main() -> mcp::Result<()> {{
    let config = McpConfig::builder()
        .address("0.0.0.0:8080")
        .build()?;

    let server = McpServer::new(config)?;
    server.start().await?;

    Ok(())
}}
"#,
        name, name, name
    );

    if let Some(parent) = output.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(output, stub)?;
    println!("✓ Server stub generated at {}", output.display());

    Ok(())
}

pub fn generate_client_stub(name: &str, output: &PathBuf) -> Result<()> {
    let stub = format!(
        r#"use mcp::{{McpClient, McpClientConfig}};
use serde_json::json;

#[tokio::main]
async fn main() -> mcp::Result<()> {{
    let config = McpClientConfig::builder()
        .url("ws://localhost:8080")
        .build()?;

    let client = McpClient::connect(config).await?;
    println!("Connected to MCP server");

    let result = client.call_tool("example_tool", json!({{}})).await?;
    println!("Tool result: {{}}", result);

    Ok(())
}}
"#,
        name
    );

    if let Some(parent) = output.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(output, stub)?;
    println!("✓ Client stub generated at {}", output.display());

    Ok(())
}
