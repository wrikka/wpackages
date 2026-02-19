# Task Library

## Introduction

The Task Library is a comprehensive task management and execution engine designed for the wterminal IDE ecosystem. It provides a robust foundation for managing, scheduling, and executing tasks with support for parallel processing, distributed execution, and advanced scheduling capabilities. Built with performance and reliability in mind, this library enables developers to create complex workflows with retry logic, rate limiting, and comprehensive metrics tracking.

The library is designed to handle everything from simple one-off tasks to complex distributed job processing pipelines, making it ideal for build systems, data processing workflows, automation scripts, and any application requiring reliable task execution with observability.

## Features

- 📋 **Task Management** - Create and manage tasks with comprehensive metadata
- ⚡ **Parallel Execution** - Execute tasks in parallel with configurable concurrency
- ⏰ **Task Scheduling** - Schedule tasks using CRON expressions for recurring jobs
- 📦 **Queue Management** - Built-in task queuing with priority support
- 💾 **Persistence** - SQLite and Redis support for task state persistence
- 📊 **Metrics** - Built-in metrics for monitoring and observability
- 🔄 **Distributed Execution** - Distributed task execution across multiple nodes
- 🔌 **Node.js Bindings** - NAPI bindings for seamless Node.js integration
- 🛡️ **Retry Logic** - Configurable retry policies for failed tasks
- 🚦 **Rate Limiting** - Built-in rate limiting to prevent resource exhaustion
- 🔁 **Circuit Breaker** - Circuit breaker pattern for fault tolerance
- 📈 **Performance Monitoring** - Detailed performance metrics and tracking

## Goals

- 🎯 Provide a reliable and efficient task execution engine
- ⚡ Maximize performance through parallel processing and optimization
- 🔒 Ensure fault tolerance with retry logic and circuit breakers
- 📊 Enable comprehensive observability with metrics and logging
- 🌐 Support distributed execution across multiple nodes
- 🔌 Provide seamless integration with multiple platforms (Rust, Node.js)
- 🛠️ Offer flexible configuration for diverse use cases
- 📈 Scale horizontally to handle high-throughput workloads
- 🎨 Maintain clean and intuitive API design
- 📚 Provide comprehensive documentation and examples

## Design Principles

- 🧩 **Modularity** - Each component is independent and reusable
- 🔒 **Type Safety** - Leverage Rust's type system for correctness
- ⚡ **Performance** - Optimized for high-throughput scenarios
- 🔄 **Resilience** - Built-in fault tolerance and error recovery
- 📊 **Observability** - First-class metrics and logging support
- 🔌 **Extensibility** - Easy to extend with custom handlers and policies
- 🎨 **Simplicity** - Clean, intuitive API design
- 🧪 **Testability** - Comprehensive test coverage and mocking support
- 📚 **Documentation** - Extensive documentation and examples
- 🌐 **Interoperability** - Works seamlessly with other ecosystem components

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
task = { path = "../task", features = ["full"] }
parallel = { path = "../../rust-packages/parallel" }
queue = { path = "../../rust-packages/queue" }
```

</details>

<details>
<summary>As a Node.js Module</summary>

```bash
# Build the NAPI bindings
cargo build --features napi

# Install in your Node.js project
npm install ./dist
```

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/task

# Build the library
cargo build --release

# Run tests
cargo test
```

</details>

## Usage

### Basic Task Execution

```rust
use task::{Task, TaskExecutor};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let executor = TaskExecutor::new();

    let task = Task::builder()
        .name("Process Data")
        .handler(async { "processed" })
        .build();

    let result = executor.execute(task).await?;

    println!("Result: {}", result);

    Ok(())
}
```

### Creating Tasks

```rust
use task::Task;

let task = Task::builder()
    .name("Task 1")
    .description("Process user data")
    .handler(async { "result" })
    .build();
```

### Task Scheduling

```rust
use task::{Task, TaskScheduler};

let scheduler = TaskScheduler::new();

let task = Task::builder()
    .name("Scheduled Task")
    .schedule("0 * * * *") // Every hour
    .handler(async { "executed" })
    .build();

scheduler.schedule(task).await?;
```

### Parallel Execution

```rust
use task::TaskExecutor;

let executor = TaskExecutor::new();

let tasks = vec![task1, task2, task3];
let results = executor.execute_all(tasks).await?;
```

### Persistence

```rust
use task::TaskExecutor;

let executor = TaskExecutor::with_persistence("sqlite")?;
```

### Metrics

```rust
use task::TaskExecutor;

let executor = TaskExecutor::new();
executor.enable_metrics().await?;

let metrics = executor.get_metrics().await?;
```

## Examples

### Example 1: Simple Task with Retry

```rust
use task::{Task, TaskExecutor, RetryPolicy};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let retry_policy = RetryPolicy::exponential_backoff(3, Duration::from_secs(1));
    let executor = TaskExecutor::with_retry(retry_policy);

    let task = Task::builder()
        .name("Data Processing")
        .handler(async {
            // Your task logic here
            Ok::<_, task::TaskError>("processed".into())
        })
        .build();

    let result = executor.execute(task).await?;
    println!("Result: {:?}", result);

    Ok(())
}
```

### Example 2: Parallel Task Execution

```rust
use task::{Task, TaskExecutor};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let executor = TaskExecutor::new();

    let tasks = (0..10)
        .map(|i| {
            Task::builder()
                .name(format!("Task {}", i))
                .handler(async move {
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    Ok::<_, task::TaskError>(format!("Result {}", i).into())
                })
                .build()
        })
        .collect();

    let results = executor.execute_all(tasks).await?;
    println!("Completed {} tasks", results.len());

    Ok(())
}
```

### Example 3: Scheduled Task

```rust
use task::{Task, TaskScheduler};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let scheduler = TaskScheduler::new();

    let task = Task::builder()
        .name("Hourly Cleanup")
        .schedule("0 * * * *") // Every hour
        .handler(async {
            // Cleanup logic here
            Ok::<_, task::TaskError>("cleanup complete".into())
        })
        .build();

    scheduler.schedule(task).await?;
    println!("Task scheduled successfully");

    Ok(())
}
```

### Example 4: Task with Rate Limiting

```rust
use task::{Task, TaskExecutor, RateLimiter};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rate_limiter = RateLimiter::with_defaults();
    let executor = TaskExecutor::with_rate_limiter(rate_limiter);

    let task = Task::builder()
        .name("API Request")
        .handler(async {
            // Make API request
            Ok::<_, task::TaskError>("response".into())
        })
        .build();

    let result = executor.execute(task).await?;
    println!("Result: {:?}", result);

    Ok(())
}
```

## License

MIT
