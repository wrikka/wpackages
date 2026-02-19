pub mod error;
pub use error::{Error, Result};

pub mod config;
pub mod telemetry;
pub mod prelude;

pub mod constants;
pub mod types;
pub mod components;
pub mod services;
pub mod adapters;
pub mod utils;

pub mod browser;
pub use browser::BrowserManager;

pub mod cli;
pub mod daemon;
pub mod ipc;
pub mod protocol;
pub mod snapshot;
pub mod monitoring;
pub mod features;
pub mod plugins;
pub mod workflow_engine;
pub use workflow_engine::WorkflowEngine;
