//! AI Evals Application Entry Point
//!
//! This is the main application that serves as the composition root for the evaluation framework.
//! It orchestrates all the components and services to provide a complete evaluation solution.

use ai_evals::prelude::*;
use ai_evals::config::Config;
use ai_evals::services::{
    DefaultEvaluationService, MockModelService, FileDatasetService,
    FileStorageService, EvaluationService, ModelService, DatasetService, StorageService,
};
use ai_evals::components::similarity::JaccardSimilarity;
use ai_evals::adapters::logger::LoggerFactory;
use std::sync::Arc;
use clap::{Parser, Subcommand};

/// Command line arguments
#[derive(Parser, Debug)]
#[command(name = "ai-evals")]
#[command(about = "AI Evaluation Framework", long_about = None)]
struct Args {
    #[command(subcommand)]
    command: Commands,
}

/// Available commands
#[derive(Subcommand, Debug)]
enum Commands {
    /// Run an evaluation
    Run {
        /// Evaluation name
        #[arg(short, long)]
        name: String,
        /// Model to use
        #[arg(short, long, default_value = "gpt-3.5-turbo")]
        model: String,
        /// Dataset file path
        #[arg(short, long)]
        dataset: String,
        /// Maximum number of samples to evaluate
        #[arg(long)]
        max_samples: Option<usize>,
        /// Timeout in milliseconds
        #[arg(long, default_value = "30000")]
        timeout: u64,
        /// Maximum concurrent samples
        #[arg(long, default_value = "10")]
        max_concurrent: usize,
        /// Output directory for results
        #[arg(short, long)]
        output: Option<String>,
    },
    /// List available datasets
    ListDatasets {
        /// Dataset directory path
        #[arg(short, long, default_value = "./data")]
        path: String,
    },
    /// Show evaluation results
    Show {
        /// Evaluation ID
        eval_id: String,
        /// Dataset directory path
        #[arg(short, long, default_value = "./results")]
        path: String,
    },
    /// List all evaluations
    List {
        /// Results directory path
        #[arg(short, long, default_value = "./results")]
        path: String,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    // Load configuration
    let config = Config::load()
        .map_err(|e| format!("Failed to load configuration: {}", e))?;

    // Initialize telemetry
    ai_evals::init_with_config(&config)
        .map_err(|e| format!("Failed to initialize telemetry: {}", e))?;

    let logger = LoggerFactory::create("main");

    match args.command {
        Commands::Run {
            name,
            model,
            dataset,
            max_samples,
            timeout,
            max_concurrent,
            output,
        } => {
            log_info!(logger, "Starting evaluation run", name => &name, model => &model);
            
            run_evaluation(
                &config,
                name,
                model,
                dataset,
                max_samples,
                timeout,
                max_concurrent,
                output,
            )
            .await?;
        }
        Commands::ListDatasets { path } => {
            list_datasets(&path).await?;
        }
        Commands::Show { eval_id, path } => {
            show_evaluation(&eval_id, &path).await?;
        }
        Commands::List { path } => {
            list_evaluations(&path).await?;
        }
    }

    Ok(())
}

/// Run an evaluation with the given parameters
async fn run_evaluation(
    config: &Config,
    name: String,
    model: String,
    dataset: String,
    max_samples: Option<usize>,
    timeout: u64,
    max_concurrent: usize,
    output_dir: Option<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    let logger = LoggerFactory::create("evaluation");

    // Create services
    let model_service: Arc<dyn ModelService> = Arc::new(
        MockModelService::new(model.clone())
    );

    let dataset_service: Arc<dyn DatasetService> = Arc::new(
        FileDatasetService::new(std::path::PathBuf::from("./data"))
    );

    let similarity_calculator = Arc::new(JaccardSimilarity);

    let storage_service: Arc<dyn StorageService> = Arc::new(
        FileStorageService::new(
            output_dir
                .map(std::path::PathBuf::from)
                .unwrap_or_else(|| config.evaluation.results_dir.clone())
        )
    );

    // Create evaluation service
    let eval_service = DefaultEvaluationService::new(
        model_service,
        dataset_service,
        similarity_calculator,
    );

    // Create evaluation configuration
    let eval_config = EvalConfig::new(name.clone(), model, dataset)
        .with_timeout(timeout)
        .with_max_concurrent(max_concurrent);

    let eval_config = if let Some(max_samples) = max_samples {
        // Note: This would need to be added to EvalConfig
        eval_config
    } else {
        eval_config
    };

    // Run evaluation
    log_info!(logger, "Running evaluation", name => &name);
    let start_time = std::time::Instant::now();

    let result = eval_service.run_evaluation(eval_config).await
        .map_err(|e| format!("Evaluation failed: {}", e))?;

    let duration = start_time.elapsed();

    // Save results
    storage_service.save_evaluation_result(&result).await
        .map_err(|e| format!("Failed to save results: {}", e))?;

    // Display results
    println!("\n=== Evaluation Results ===");
    println!("ID: {}", result.id.0);
    println!("Name: {}", result.name);
    println!("Status: {:?}", result.status);
    println!("Duration: {:?}", duration);
    println!("Total Samples: {}", result.total_samples);
    println!("Passed Samples: {}", result.passed_samples);
    println!("Failed Samples: {}", result.failed_samples);
    println!("Pass Rate: {:.2}%", result.pass_rate() * 100.0);
    println!("Average Score: {:.3}", result.average_score);

    if let Some(duration_ms) = result.duration_ms() {
        println!("Average Latency: {:.2}ms", duration_ms as f64 / result.total_samples as f64);
    }

    Ok(())
}

/// List available datasets
async fn list_datasets(data_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let logger = LoggerFactory::create("datasets");
    
    let dataset_service = FileDatasetService::new(std::path::PathBuf::from(data_path));
    let datasets = dataset_service.list_datasets().await?;

    if datasets.is_empty() {
        println!("No datasets found in {}", data_path);
        return Ok(());
    }

    println!("\n=== Available Datasets ===");
    for dataset in datasets {
        println!("ID: {}", dataset.id);
        println!("Name: {}", dataset.name);
        println!("Description: {}", dataset.description);
        println!("Samples: {}", dataset.sample_count);
        println!("Format: {:?}", dataset.format);
        println!("Source: {:?}", dataset.source);
        println!("---");
    }

    log_info!(logger, "Listed datasets", count => datasets.len());
    Ok(())
}

/// Show evaluation results
async fn show_evaluation(eval_id: &str, results_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let logger = LoggerFactory::create("results");
    
    let storage_service = FileStorageService::new(std::path::PathBuf::from(results_path));
    let result = storage_service.load_evaluation_result(eval_id).await?;

    println!("\n=== Evaluation Results ===");
    println!("ID: {}", result.id.0);
    println!("Name: {}", result.name);
    println!("Status: {:?}", result.status);
    println!("Started: {}", result.started_at);
    if let Some(completed) = result.completed_at {
        println!("Completed: {}", completed);
    }
    println!("Total Samples: {}", result.total_samples);
    println!("Passed Samples: {}", result.passed_samples);
    println!("Failed Samples: {}", result.failed_samples);
    println!("Pass Rate: {:.2}%", result.pass_rate() * 100.0);
    println!("Average Score: {:.3}", result.average_score);

    if let Some(duration_ms) = result.duration_ms() {
        println!("Duration: {}ms", duration_ms);
        println!("Average Latency: {:.2}ms", duration_ms as f64 / result.total_samples as f64);
    }

    println!("\n=== Sample Results ===");
    for (i, sample) in result.sample_results.iter().take(10).enumerate() {
        println!("{}. Sample ID: {}", i + 1, sample.sample_id);
        println!("   Score: {:.3}", sample.score);
        println!("   Passed: {}", sample.passed);
        println!("   Latency: {}ms", sample.latency_ms);
        if let Some(error) = &sample.error {
            println!("   Error: {}", error);
        }
        println!("   Output: {}", truncate_text(&sample.output, 100));
        println!();
    }

    if result.sample_results.len() > 10 {
        println!("... and {} more samples", result.sample_results.len() - 10);
    }

    log_info!(logger, "Showed evaluation results", eval_id => eval_id);
    Ok(())
}

/// List all evaluations
async fn list_evaluations(results_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let logger = LoggerFactory::create("results");
    
    let storage_service = FileStorageService::new(std::path::PathBuf::from(results_path));
    let evaluations = storage_service.list_evaluations().await?;

    if evaluations.is_empty() {
        println!("No evaluations found in {}", results_path);
        return Ok(());
    }

    println!("\n=== Evaluation History ===");
    for eval in evaluations {
        println!("ID: {}", eval.id);
        println!("Name: {}", eval.name);
        println!("Status: {}", eval.status);
        println!("Created: {}", eval.created_at);
        if let Some(completed) = eval.completed_at {
            println!("Completed: {}", completed);
        }
        println!("Samples: {}", eval.total_samples);
        println!("Pass Rate: {:.2}%", eval.pass_rate * 100.0);
        println!("---");
    }

    log_info!(logger, "Listed evaluations", count => evaluations.len());
    Ok(())
}

/// Truncate text for display
fn truncate_text(text: &str, max_len: usize) -> String {
    if text.len() <= max_len {
        text.to_string()
    } else {
        format!("{}...", &text[..max_len.saturating_sub(3)])
    }
}
