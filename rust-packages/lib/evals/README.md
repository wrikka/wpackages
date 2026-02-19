# AI Evaluation Framework

A comprehensive Rust library for testing and benchmarking AI systems with strict functional programming principles.

## Features

- **Pure Functional Design**: Clear separation between pure logic and I/O operations
- **Comprehensive Testing**: Support for unit tests, integration tests, and benchmarks
- **Multiple Metrics**: Built-in similarity metrics, accuracy scoring, and performance tracking
- **Dataset Management**: Load and manage test datasets with validation
- **Provider Agnostic**: Support for multiple AI providers (OpenAI, Anthropic, etc.)
- **Async Support**: Full async/await support for non-blocking operations
- **Type Safety**: Comprehensive error handling with custom error types

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
ai-evals = { path = "../lib/evals" }
```

## Quick Start

```rust
use ai_evals::prelude::*;

#[tokio::main]
async fn main() -> EvalResult<()> {
    // Initialize the evaluation library
    init()?;
    
    // Create evaluation services
    let model_service = std::sync::Arc::new(MockModelService::new("gpt-3.5-turbo".to_string()));
    let dataset_service = std::sync::Arc::new(FileDatasetService::new("./data".into()));
    let similarity_calculator = std::sync::Arc::new(JaccardSimilarity);
    
    let eval_service = DefaultEvaluationService::new(
        model_service,
        dataset_service,
        similarity_calculator,
    );
    
    // Run evaluation
    let config = EvalConfig::new(
        "test_evaluation".to_string(),
        "gpt-3.5-turbo".to_string(),
        "test_dataset.json".to_string(),
    );
    
    let result = eval_service.run_evaluation(config).await?;
    println!("Evaluation completed with pass rate: {:.2}%", result.pass_rate() * 100.0);
    
    Ok(())
}
```

## Architecture

The library follows strict Rust best practices with clear separation of concerns:

### Components Layer (Pure Functions)

```rust
// Pure functions - no I/O, no side effects
pub mod components {
    pub mod evaluation;    // Pure evaluation logic
    pub mod similarity;    // Similarity calculations
    pub mod metrics;       // Metric calculations
    pub mod validation;    // Input validation
}
```

### Services Layer (I/O Operations)

```rust
// I/O operations - trait-based for testability
pub mod services {
    pub mod evaluation;    // Evaluation orchestration
    pub mod model;         // AI model interactions
    pub mod dataset;       // Dataset loading/saving
}
```

### Adapters Layer (External Dependencies)

```rust
// Wrappers for external libraries
pub mod adapters {
    pub mod openai;        // OpenAI adapter
    pub mod anthropic;     // Anthropic adapter
    pub mod local;         // Local model adapter
}
```

## Core Types

### EvalConfig

```rust
pub struct EvalConfig {
    pub name: String,
    pub model: String,
    pub dataset: String,
    pub max_samples: Option<usize>,
    pub timeout_ms: u64,
    pub max_concurrency: usize,
}
```

### EvalSample & SampleResult

```rust
pub struct EvalSample {
    pub id: String,
    pub input: String,
    pub expected_output: Option<String>,
    pub metadata: HashMap<String, String>,
}

pub struct SampleResult {
    pub sample_id: String,
    pub actual_output: String,
    pub expected_output: Option<String>,
    pub similarity_score: Option<f64>,
    pub is_correct: bool,
    pub execution_time_ms: u64,
    pub error: Option<String>,
}
```

### EvalResult

```rust
pub struct FullEvalResult {
    pub id: EvalId,
    pub name: String,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub status: EvalStatus,
    pub total_samples: usize,
    pub passed_samples: usize,
    pub failed_samples: usize,
    pub sample_results: Vec<SampleResult>,
    pub metrics: HashMap<String, f64>,
}
```

## Usage Examples

### Basic Evaluation

```rust
use ai_evals::prelude::*;

let config = EvalConfig::new(
    "my_evaluation".to_string(),
    "gpt-4".to_string(),
    "test_cases.json".to_string(),
);

let result = eval_service.run_evaluation(config).await?;
println!("Pass rate: {:.2}%", result.pass_rate() * 100.0);
```

### Custom Similarity Metrics

```rust
use ai_evals::components::similarity::*;

// Use built-in similarity calculators
let jaccard = JaccardSimilarity;
let cosine = CosineSimilarity;
let levenshtein = LevenshteinSimilarity;

// Calculate similarity
let score = jaccard.calculate("hello", "hello world").await?;
```

### Dataset Management

```rust
use ai_evals::services::dataset::*;

let dataset_service = FileDatasetService::new("./datasets".into());

// Load dataset
let samples = dataset_service.load_dataset("my_test_set.json").await?;

// Validate dataset
let validation_result = dataset_service.validate_dataset(&samples).await?;
if !validation_result.is_valid {
    println!("Dataset validation failed: {:?}", validation_result.errors);
}
```

### Custom Model Service

```rust
use ai_evals::services::model::*;

#[async_trait]
pub trait CustomModelService: ModelService {
    async fn generate_response(&self, input: &str) -> EvalResult<String>;
}

pub struct MyModelService {
    api_key: String,
}

#[async_trait]
impl ModelService for MyModelService {
    async fn generate_response(&self, input: &str) -> EvalResult<String> {
        // Custom model logic here
        Ok(format!("Custom response to: {}", input))
    }
}
```

## Built-in Metrics

### Similarity Metrics

- **Jaccard Similarity**: Set-based similarity for text comparison
- **Cosine Similarity**: Vector-based similarity using embeddings
- **Levenshtein Distance**: Edit distance for string similarity
- **BLEU Score**: Machine translation evaluation metric
- **ROUGE Score**: Summarization evaluation metric

### Performance Metrics

- **Response Time**: Time taken to generate response
- **Token Usage**: Input/output token consumption
- **Accuracy Rate**: Percentage of correct responses
- **Error Rate**: Percentage of failed evaluations

## Error Handling

Comprehensive error types with `thiserror`:

```rust
#[derive(Error, Debug)]
pub enum EvalError {
    #[error("Dataset not found: {0}")]
    DatasetNotFound(String),
    
    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),
    
    #[error("Evaluation failed: {0}")]
    EvaluationFailed(String),
    
    #[error("Model error: {0}")]
    ModelError(String),
    
    #[error("Metric calculation error: {0}")]
    MetricError(String),
    
    #[error("Timeout error: operation timed out after {0}ms")]
    TimeoutError(u64),
}
```

## Configuration

### Environment Variables

```env
# Default model to use
EVALS_DEFAULT_MODEL=gpt-3.5-turbo

# Default timeout in milliseconds
EVALS_DEFAULT_TIMEOUT=30000

# Default concurrency
EVALS_DEFAULT_CONCURRENCY=4

# Dataset directory
EVALS_DATASET_DIR=./datasets
```

### Config File Support

```toml
[evaluation]
default_model = "gpt-4"
default_timeout_ms = 30000
max_concurrency = 10
dataset_dir = "./datasets"

[logging]
level = "info"
structured = true
file_path = "./logs/evals.log"
```

## Testing

### Unit Tests

```bash
cargo test
```

### Integration Tests

```bash
cargo test --test integration
```

### Benchmarks

```bash
cargo bench
```

### Test Organization

```
tests/
├── unit/           # Unit tests for pure functions
├── integration/    # Integration tests for services
├── fixtures/       # Test data and mock responses
└── benchmarks/     # Performance benchmarks
```

## Best Practices

### Functional Programming

- **Pure Functions**: All components functions are pure (no side effects)
- **Immutability**: Default to immutable data structures
- **Explicit Dependencies**: All dependencies injected via constructors
- **Error Handling**: Comprehensive error types with `Result<T, Error>`

### Performance

- **Async/Await**: Non-blocking operations throughout
- **Resource Management**: Proper cleanup and resource handling
- **Memory Safety**: No unsafe code, proper borrowing
- **Concurrency**: Thread-safe operations with proper synchronization

### Testing

- **Property-Based Testing**: Use `proptest` for property-based tests
- **Mock Services**: Trait-based mocking for isolated testing
- **Test Coverage**: Aim for high coverage of critical paths
- **Benchmarking**: Performance tests for evaluation metrics

## Integration Examples

### With CI/CD Pipeline

```rust
use ai_evals::prelude::*;

// In your CI pipeline
let eval_result = eval_service.run_evaluation(config).await?;

if eval_result.pass_rate() < 0.95 {
    std::process::exit(1);
}
```

### With Monitoring

```rust
use ai_evals::prelude::*;

let result = eval_service.run_evaluation(config).await?;

// Send metrics to monitoring system
metrics::histogram!("eval.pass_rate", result.pass_rate());
metrics::histogram!("eval.total_samples", result.total_samples as f64);
metrics::histogram!("eval.execution_time", result.execution_time_ms() as f64);
```

## Contributing

1. Follow Rust best practices and functional programming principles
2. Add comprehensive tests for new functionality
3. Ensure all pure functions remain pure (no I/O)
4. Document public APIs with examples
5. Run `cargo clippy` and `cargo fmt` before submitting

## License

MIT License - see LICENSE file for details.
