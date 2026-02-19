use clap::{Parser, Subcommand};
use std::fs;
use std::path::PathBuf;
use anyhow::Result;

#[derive(Parser, Debug)]
#[command(name = "mcp-cli")]
#[command(about = "MCP CLI tools for scaffolding and development")]
pub struct McpCli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Scaffold a new MCP project
    Scaffold {
        /// Project type
        #[arg(short, long)]
        project_type: String,
        /// Project name
        #[arg(short, long)]
        name: String,
        /// Output directory
        #[arg(short, long, default_value = ".")]
        output: PathBuf,
    },
    /// Generate server stub
    GenerateServer {
        /// Server name
        #[arg(short, long)]
        name: String,
        /// Output file
        #[arg(short, long)]
        output: PathBuf,
    },
    /// Generate client stub
    GenerateClient {
        /// Client name
        #[arg(short, long)]
        name: String,
        /// Output file
        #[arg(short, long)]
        output: PathBuf,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProjectType {
    Server,
    Client,
    Full,
}

impl std::str::FromStr for ProjectType {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "server" => Ok(ProjectType::Server),
            "client" => Ok(ProjectType::Client),
            "full" => Ok(ProjectType::Full),
            _ => Err(anyhow::anyhow!("Invalid project type: {}", s)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ScaffoldConfig {
    pub project_type: ProjectType,
    pub name: String,
    pub output_dir: PathBuf,
}

pub fn scaffold_project(config: ScaffoldConfig) -> Result<()> {
    let project_dir = config.output_dir.join(&config.name);
    
    fs::create_dir_all(&project_dir)?;

    match config.project_type {
        ProjectType::Server => {
            create_server_structure(&project_dir, &config.name)?;
        }
        ProjectType::Client => {
            create_client_structure(&project_dir, &config.name)?;
        }
        ProjectType::Full => {
            create_full_structure(&project_dir, &config.name)?;
        }
    }

    println!("✓ MCP project '{}' created at {}", config.name, project_dir.display());
    Ok(())
}

fn create_server_structure(dir: &PathBuf, name: &str) -> Result<()> {
    let src_dir = dir.join("src");
    fs::create_dir_all(&src_dir)?;

    let cargo_toml = format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[dependencies]
mcp = {{ path = "{}" }}
tokio = {{ version = "1.0", features = ["full"] }}
"#,
        name,
        std::env::current_dir()?.display()
    );

    fs::write(dir.join("Cargo.toml"), cargo_toml)?;

    let main_rs = format!(
        r#"use mcp::{{McpServer, McpConfig}};

#[tokio::main]
async fn main() -> mcp::Result<()> {{
    let config = McpConfig::builder()
        .address("0.0.0.0:8080")
        .build()?;

    let server = McpServer::new(config)?;
    server.start().await?;

    Ok(())
}}
"#
    );

    fs::write(src_dir.join("main.rs"), main_rs)?;

    Ok(())
}

fn create_client_structure(dir: &PathBuf, name: &str) -> Result<()> {
    let src_dir = dir.join("src");
    fs::create_dir_all(&src_dir)?;

    let cargo_toml = format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[dependencies]
mcp = {{ path = "{}" }}
tokio = {{ version = "1.0", features = ["full"] }}
"#,
        name,
        std::env::current_dir()?.display()
    );

    fs::write(dir.join("Cargo.toml"), cargo_toml)?;

    let main_rs = format!(
        r#"use mcp::{{McpClient, McpClientConfig}};

#[tokio::main]
async fn main() -> mcp::Result<()> {{
    let config = McpClientConfig::builder()
        .url("ws://localhost:8080")
        .build()?;

    let client = McpClient::connect(config).await?;
    
    println!("Connected to MCP server");

    Ok(())
}}
"#
    );

    fs::write(src_dir.join("main.rs"), main_rs)?;

    Ok(())
}

fn create_full_structure(dir: &PathBuf, name: &str) -> Result<()> {
    let src_dir = dir.join("src");
    fs::create_dir_all(&src_dir)?;

    let cargo_toml = format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[dependencies]
mcp = {{ path = "{}" }}
tokio = {{ version = "1.0", features = ["full"] }}
"#,
        name,
        std::env::current_dir()?.display()
    );

    fs::write(dir.join("Cargo.toml"), cargo_toml)?;

    let main_rs = format!(
        r#"use mcp::{{McpServer, McpConfig, McpClient, McpClientConfig}};

#[tokio::main]
async fn main() -> mcp::Result<()> {{
    let args: Vec<String> = std::env::args().collect();

    if args.len() > 1 && args[1] == "server" {{
        let config = McpConfig::builder()
            .address("0.0.0.0:8080")
            .build()?;

        let server = McpServer::new(config)?;
        server.start().await?;
    }} else if args.len() > 1 && args[1] == "client" {{
        let config = McpClientConfig::builder()
            .url("ws://localhost:8080")
            .build()?;

        let client = McpClient::connect(config).await?;
        println!("Connected to MCP server");
    }} else {{
        println!("Usage: {} [server|client]", args[0]);
    }}

    Ok(())
}}
"#
    );

    fs::write(src_dir.join("main.rs"), main_rs)?;

    Ok(())
}
