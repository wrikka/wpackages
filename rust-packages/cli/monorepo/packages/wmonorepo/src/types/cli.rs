use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    #[arg(long, default_value_t = 0)]
    pub concurrency: usize,

    #[arg(long)]
    pub explain: bool,

    #[arg(long)]
    pub report_json: Option<String>,

    #[arg(long)]
    pub dry_run: bool,

    #[arg(long)]
    pub print_graph: bool,

    #[arg(long)]
    pub no_cache: bool,

    #[arg(long)]
    pub force: bool,

    #[arg(long)]
    pub strict: bool,

    #[arg(long)]
    pub clean: bool,

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

        /// Filter projects by name glob or tag expression (e.g. "@scope/*", "tag:frontend & !tag:deprecated")
        #[arg(long)]
        filter: Option<String>,
    },
    /// Watch and re-run tasks when inputs change
    Watch {
        /// The task to run (e.g., build, lint)
        task: String,

        /// The scope of the task to run (e.g., //apps/web:build)
        #[arg(short, long)]
        scope: Option<String>,

        /// Filter projects by name glob or tag expression
        #[arg(long)]
        filter: Option<String>,

        /// Polling interval in milliseconds
        #[arg(long, default_value_t = 1_000)]
        interval_ms: u64,

        /// Watch mode (poll|native)
        #[arg(long, default_value = "poll")]
        watch_mode: String,
    },
    /// Create a pruned subset of the repo for CI/container usage
    Prune {
        /// Output directory (will be created if missing)
        out_dir: String,

        /// Optional scope package name
        #[arg(short, long)]
        scope: Option<String>,

        /// Filter projects by name glob or tag expression
        #[arg(long)]
        filter: Option<String>,
    },
    Changed {
        #[arg(long, default_value = "HEAD~1")]
        since: String,

        /// Output as JSON array
        #[arg(long)]
        json: bool,
    },
    /// List affected projects based on git changes (includes dependents)
    Affected {
        #[arg(long, default_value = "HEAD~1")]
        since: String,

        /// Filter affected projects by name glob or tag expression
        #[arg(long)]
        filter: Option<String>,

        /// Output as JSON array
        #[arg(long)]
        json: bool,
    },
    /// Initialize a new wmo-repo configuration
    Init,
    /// Check for common problems in the monorepo
    Doctor,

    /// Cache management commands
    Cache {
        #[command(subcommand)]
        command: CacheCommand,
    },
}

#[derive(Subcommand)]
pub enum CacheCommand {
    /// Print cache statistics
    Inspect,
    /// List cache entries
    Ls,
    /// Garbage collect cache entries
    Gc {
        /// Maximum total cache size in bytes
        #[arg(long)]
        max_bytes: Option<u64>,

        /// Maximum number of cache entries
        #[arg(long)]
        max_entries: Option<u64>,

        /// Remove entries older than this many seconds
        #[arg(long)]
        ttl_seconds: Option<u64>,

        /// Show what would be removed without deleting
        #[arg(long)]
        dry_run: bool,
    },
    /// Remove all cached artifacts
    Clean,
}
