use clap::{Parser, Subcommand};
use codesearch::config::Config;
use codesearch::commands::Command;

#[derive(Debug, Parser)]
#[command(name = "codesearch")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Search(codesearch::commands::search::SearchCommand),
    SearchSyntax(codesearch::commands::search_syntax::SearchSyntaxCommand),
    SearchSymbol(codesearch::commands::search_symbol::SearchSymbolCommand),
    SearchSemantic(codesearch::commands::search_semantic::SearchSemanticCommand),
    SearchFuzzy(codesearch::commands::search_fuzzy::SearchFuzzyCommand),
    SearchHybrid(codesearch::commands::search_hybrid::SearchHybridCommand),
    SearchDiff(codesearch::commands::search_diff::SearchDiffCommand),
    Blame(codesearch::commands::blame::BlameCommand),
    CallGraph(codesearch::commands::call_graph::CallGraphCommand),
    DataFlow(codesearch::commands::data_flow::DataFlowCommand),
    DependencyGraph(codesearch::commands::dependency_graph::DependencyGraphCommand),
    ExtractSignatures(codesearch::commands::extract_signatures::ExtractSignaturesCommand),
    DetectSmells(codesearch::commands::detect_smells::DetectSmellsCommand),
    FindSimilar(codesearch::commands::find_similar::FindSimilarCommand),
    Daemon(codesearch::commands::daemon::DaemonCommand),
    Query(codesearch::commands::query::QueryCommand),
    Index(codesearch::commands::index::IndexCommand),
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let cli = Cli::parse();
    let config: Config = match codesearch::config::load() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Warning: Could not load configuration: {}. Using default.", e);
            Default::default()
        }
    };

    match cli.command {
        Commands::Search(cmd) => {
            cmd.execute()?;
        }
        Commands::SearchSyntax(cmd) => {
            cmd.execute()?;
        }
        Commands::SearchSymbol(cmd) => {
            cmd.execute()?;
        }
        Commands::SearchSemantic(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::SearchFuzzy(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::SearchHybrid(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::SearchDiff(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::Blame(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::CallGraph(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::DataFlow(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::DependencyGraph(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::ExtractSignatures(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::DetectSmells(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::FindSimilar(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::Daemon(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::Query(cmd) => {
            cmd.execute(&config).await?;
        }
        Commands::Index(cmd) => {
            cmd.execute(&config).await?;
        }
    }

    Ok(())
}

