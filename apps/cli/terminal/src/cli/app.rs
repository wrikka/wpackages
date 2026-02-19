use crate::cli::config::AppConfig;
use crate::cli::error::ExtError;
use anyhow::Result;
use clap::{Parser, Subcommand};
use colored::Colorize;
use tracing::info;

#[derive(Parser)]
#[command(name = "wterminal")]
#[command(about = "CLI tool for wterminal", long_about = None)]
#[command(version = crate::cli::constants::VERSION)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,

    /// Enable verbose logging
    #[arg(short, long, global = true)]
    pub verbose: bool,

    /// Set log level (trace, debug, info, warn, error)
    #[arg(short, long, global = true)]
    pub log_level: Option<String>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Create a new extension
    Create {
        /// Extension name
        name: String,

        /// Extension type (native, wasm)
        #[arg(short, long, default_value = "native")]
        #[arg(value_parser = clap::value_parser!(ExtensionType))]
        ext_type: ExtensionType,

        /// Target directory (default: current directory)
        #[arg(short, long)]
        directory: Option<String>,
    },

    /// Build an extension
    Build {
        /// Extension directory
        #[arg(short, long)]
        path: Option<String>,

        /// Build in release mode
        #[arg(short, long)]
        release: bool,

        /// Build for target triple
        #[arg(short, long)]
        target: Option<String>,
    },

    /// Test an extension
    Test {
        /// Extension directory
        #[arg(short, long)]
        path: Option<String>,

        /// Run tests with output
        #[arg(short, long)]
        verbose: bool,
    },

    /// Publish an extension to marketplace
    Publish {
        /// Extension directory
        #[arg(short, long)]
        path: Option<String>,

        /// Marketplace URL
        #[arg(short, long)]
        marketplace: Option<String>,

        /// Dry run (don't actually publish)
        #[arg(long)]
        dry_run: bool,
    },

    /// List installed extensions
    List {
        /// Show detailed information
        #[arg(short, long)]
        detailed: bool,

        /// Filter by status (enabled, disabled, all)
        #[arg(short, long, default_value = "all")]
        status: String,
    },

    /// Enable an extension
    Enable {
        /// Extension ID or name
        extension_id: String,
    },

    /// Disable an extension
    Disable {
        /// Extension ID or name
        extension_id: String,
    },

    /// Uninstall an extension
    Uninstall {
        /// Extension ID or name
        extension_id: String,

        /// Confirm without prompting
        #[arg(short, long)]
        force: bool,
    },

    /// Search for extensions in marketplace
    Search {
        /// Search query
        query: String,

        /// Limit results
        #[arg(short, long, default_value = "10")]
        limit: usize,

        /// Show detailed information
        #[arg(short, long)]
        detailed: bool,
    },

    /// Get extension information
    Info {
        /// Extension ID or name
        extension_id: String,
    },

    /// Check for extension updates
    Update {
        /// Extension ID or name (if not specified, check all)
        extension_id: Option<String>,

        /// Update all without prompting
        #[arg(short, long)]
        all: bool,
    },
}

#[derive(clap::ValueEnum, Clone, Debug, PartialEq)]
pub enum ExtensionType {
    Native,
    Wasm,
}

pub struct App {
    config: AppConfig,
    cli: Cli,
}

impl App {
    pub fn new(config: AppConfig, cli: Cli) -> Self {
        Self { config, cli }
    }

    pub async fn run(self) -> Result<()> {
        info!("{} v{}", crate::cli::constants::NAME.bright_green(), crate::cli::constants::VERSION);

        match self.cli.command {
            Commands::Create {
                name,
                ext_type,
                directory,
            } => {
                crate::cli::services::create::execute(name, ext_type, directory).await?;
            }
            Commands::Build {
                path,
                release,
                target,
            } => {
                crate::cli::services::build::execute(path, release, target).await?;
            }
            Commands::Test { path, verbose } => {
                crate::cli::services::test::execute(path, verbose).await?;
            }
            Commands::Publish {
                path,
                marketplace,
                dry_run,
            } => {
                crate::cli::services::publish::execute(path, marketplace, dry_run).await?;
            }
            Commands::List { detailed, status } => {
                crate::cli::services::list::execute(detailed, status).await?;
            }
            Commands::Enable { extension_id } => {
                crate::cli::services::enable::execute(extension_id).await?;
            }
            Commands::Disable { extension_id } => {
                crate::cli::services::disable::execute(extension_id).await?;
            }
            Commands::Uninstall {
                extension_id,
                force,
            } => {
                crate::cli::services::uninstall::execute(extension_id, force).await?;
            }
            Commands::Search {
                query,
                limit,
                detailed,
            } => {
                crate::cli::services::search::execute(query, limit, detailed).await?;
            }
            Commands::Info { extension_id } => {
                crate::cli::services::info::execute(extension_id).await?;
            }
            Commands::Update {
                extension_id,
                all,
            } => {
                crate::cli::services::update::execute(extension_id, all).await?;
            }
        }

        Ok(())
    }
}
