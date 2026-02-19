use crate::config::Config;
use crate::index::{InMemoryIndex, SearchIndex};
use crate::index::watcher::IndexWatcher;
use async_trait::async_trait;
use clap::{Args, Subcommand};
use std::sync::Arc;

use super::Command;

#[derive(Debug, Args)]
pub struct IndexCommand {
    #[command(subcommand)]
    pub action: IndexAction,
}

#[derive(Debug, Subcommand)]
pub enum IndexAction {
    /// Build index for the workspace
    Build(BuildArgs),
    /// Show index statistics
    Stats(StatsArgs),
    /// Start/stop file watcher
    Watch(WatchArgs),
    /// Clear the index
    Clear(ClearArgs),
}

#[derive(Debug, Args)]
pub struct BuildArgs {
    /// Root directory to index
    #[arg(short, long, default_value = ".")]
    pub root: String,
    
    /// Enable file watching after build
    #[arg(long, default_value = "true")]
    pub watch: bool,
    
    /// Force rebuild even if index exists
    #[arg(long)]
    pub force: bool,
}

#[derive(Debug, Args)]
pub struct StatsArgs {
    /// Root directory
    #[arg(short, long, default_value = ".")]
    pub root: String,
}

#[derive(Debug, Args)]
pub struct WatchArgs {
    /// Root directory
    #[arg(short, long, default_value = ".")]
    pub root: String,
    
    /// Enable or disable watching
    #[arg(long)]
    pub enable: bool,
}

#[derive(Debug, Args)]
pub struct ClearArgs {
    /// Root directory
    #[arg(short, long, default_value = ".")]
    pub root: String,
}

#[async_trait]
impl Command for IndexCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        match &self.action {
            IndexAction::Build(args) => build_index(args, config).await,
            IndexAction::Stats(args) => show_stats(args, config).await,
            IndexAction::Watch(args) => toggle_watch(args, config).await,
            IndexAction::Clear(args) => clear_index(args, config).await,
        }
    }
}

async fn build_index(args: &BuildArgs, _config: &Config) -> anyhow::Result<()> {
    use std::time::Instant;
    
    let start = Instant::now();
    let root = std::path::PathBuf::from(&args.root);
    
    println!("Building index for: {}", args.root);
    
    let index = Arc::new(InMemoryIndex::new(root.clone()));
    let watcher = IndexWatcher::new(root.clone(), index.clone())?;
    
    let indexed_files = watcher.initial_index().await?;
    let duration = start.elapsed();
    
    println!(
        "Indexed {} files in {:.2}s",
        indexed_files,
        duration.as_secs_f64()
    );
    
    let stats = index.stats();
    println!(
        "Total symbols: {} | Total size: {} bytes",
        stats.total_symbols, stats.total_size
    );
    
    if args.watch {
        println!("File watcher started. Press Ctrl+C to stop.");
        tokio::signal::ctrl_c().await?;
        println!("Stopping watcher...");
    }
    
    Ok(())
}

async fn show_stats(args: &StatsArgs, _config: &Config) -> anyhow::Result<()> {
    let root = std::path::PathBuf::from(&args.root);
    let index_path = root.join(".codesearch").join("index.bin");
    
    if !index_path.exists() {
        println!("No index found for: {}", args.root);
        println!("Run `codesearch index build` to create an index.");
        return Ok(());
    }
    
    let index = InMemoryIndex::new(root);
    index.load()?;
    
    let stats = index.stats();
    
    println!("Index Statistics for: {}", args.root);
    println!("  Files indexed: {}", stats.total_files);
    println!("  Total symbols: {}", stats.total_symbols);
    println!("  Total size: {} bytes", stats.total_size);
    println!("  Last updated: {}", stats.last_updated);
    println!("  Index path: {}", stats.index_path.display());
    
    Ok(())
}

async fn toggle_watch(args: &WatchArgs, _config: &Config) -> anyhow::Result<()> {
    if args.enable {
        println!("Starting file watcher for: {}", args.root);
        println!("Press Ctrl+C to stop.");
        
        let root = std::path::PathBuf::from(&args.root);
        let index = Arc::new(InMemoryIndex::new(root.clone()));
        index.load()?;
        
        let mut watcher = IndexWatcher::new(root, index)?;
        watcher.start()?;
        
        tokio::signal::ctrl_c().await?;
        
        watcher.stop()?;
        println!("Watcher stopped.");
    } else {
        println!("File watcher disabled.");
    }
    
    Ok(())
}

async fn clear_index(args: &ClearArgs, _config: &Config) -> anyhow::Result<()> {
    let root = std::path::PathBuf::from(&args.root);
    let index_path = root.join(".codesearch");
    
    if index_path.exists() {
        std::fs::remove_dir_all(&index_path)?;
        println!("Index cleared for: {}", args.root);
    } else {
        println!("No index found for: {}", args.root);
    }
    
    Ok(())
}
