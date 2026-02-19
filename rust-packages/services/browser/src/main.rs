use browser_use::cli::Cli;
use browser_use::config::LogFormat;
use clap::Parser;

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    browser_use::telemetry::init(
        cli.verbose.log_level_filter().as_str(),
        &LogFormat::Pretty,
    );

    if let Err(e) = browser_use::cli::run(cli).await {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
