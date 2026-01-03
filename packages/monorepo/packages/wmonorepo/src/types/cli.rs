use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Run tasks in the monorepo
    Run {
        /// The task to run (e.g., build, lint)
        task: String,

        /// The scope of the task to run (e.g., //apps/web:build)
        #[arg(short, long)]
        scope: Option<String>,
    },
}
