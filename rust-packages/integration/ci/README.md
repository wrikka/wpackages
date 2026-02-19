# CI/CD Integration Library

## Introduction

Comprehensive CI/CD integration library for wterminal IDE. This library provides a unified interface for interacting with various CI/CD platforms, enabling developers to monitor pipeline status, trigger builds, and integrate CI/CD workflows directly into the IDE.

## Features

- 🔌 **GitHub Actions** - Full support for workflow runs, jobs, and steps
- 🔄 **GitLab CI** - (Coming soon)
- 🔧 **Jenkins** - (Coming soon)
- 📊 **Status Monitoring** - Real-time pipeline status tracking
- 🔍 **Log Access** - Access build and deployment logs
- ⚡ **Fast** - Optimized for performance

## Goal

- 🎯 Provide unified CI/CD integration for wterminal IDE
- 📊 Enable real-time pipeline monitoring
- 🔍 Facilitate log access and debugging
- 🔄 Support multiple CI/CD platforms

## Design Principles

- 🔌 **Unified Interface** - Consistent API across platforms
- 📊 **Real-time** - Live status updates
- 🔍 **Transparent** - Full visibility into CI/CD processes
- ⚡ **Efficient** - Minimal overhead

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
ci_cd = { path = "../ci-cd" }
```

## Usage

### GitHub Actions Integration

```rust
use ci_cd::{GitHubActions, CiStatusProvider};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = GitHubActions::new(
        "your_token".to_string(),
        "owner".to_string(),
        "repo".to_string()
    );

    let pipelines = provider.get_latest_pipelines(10).await?;
    
    for pipeline in pipelines {
        println!("Pipeline: {}, Status: {}", pipeline.name, pipeline.status);
    }
    
    Ok(())
}
```

## Examples

### Monitor Pipeline Status

```rust
use ci_cd::GitHubActions;

let provider = GitHubActions::new(token, owner, repo);

// Get latest workflows
let workflows = provider.get_latest_workflows(5).await?;

// Get specific workflow run
let run = provider.get_workflow_run(workflow_id).await?;
println!("Status: {}, Conclusion: {}", run.status, run.conclusion);
```

## License

MIT
