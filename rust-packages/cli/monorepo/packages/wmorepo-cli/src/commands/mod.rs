// CLI commands

use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "wmorepo")]
#[command(about = "Fast monorepo task runner", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Parser, Debug)]
pub enum Commands {
    Run {
        task: String,
        #[arg(short, long)]
        scope: Option<String>,
    },
    Watch {
        task: String,
        #[arg(short, long)]
        scope: Option<String>,
    },
    Prune {
        #[arg(short, long)]
        out_dir: Option<String>,
    },
}

pub fn run_cli() {
    let cli = Cli::parse();
    match cli.command {
        Commands::Run { task, scope } => {
            println!("Running task: {}", task);
            if let Some(s) = scope {
                println!("Scope: {}", s);
            }
        }
        Commands::Watch { task, scope } => {
            println!("Watching task: {}", task);
            if let Some(s) = scope {
                println!("Scope: {}", s);
            }
        }
        Commands::Prune { out_dir } => {
            println!("Pruning...");
            if let Some(dir) = out_dir {
                println!("Output dir: {}", dir);
            }
        }
    }
}
