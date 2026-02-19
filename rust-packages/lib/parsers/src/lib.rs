//! # Parsers Library
//!
//! A high-performance, extensible parsing library supporting JSON, TOML, XML, and YAML formats.
//! Built with Rust best practices and Node.js integration via NAPI.
//!
//! ## Features
//!
//! - **Multi-format support**: JSON, TOML, XML, YAML parsing and serialization
//! - **Auto-detection**: Automatic format detection from input content
//! - **Streaming**: Async streaming parser for large files
//! - **Validation**: Schema validation support
//! - **Performance**: Zero-copy parsing and caching
//! - **Security**: Input sanitization and size limits
//! - **Extensible**: Plugin system for custom parsers
//! - **Node.js integration**: NAPI bindings for JavaScript/TypeScript
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use parsers::prelude::*;
//!
//! // Auto-detect and parse
//! let data = parse_auto("{\"key\": \"value\"}")?;
//!
//! // Parse with specific format
//! let json_data = parse_json("{\"key\": \"value\"}")?;
//! let toml_data = parse_toml("[section]\nkey = \"value\"")?;
//!
//! // Convert between formats
//! let yaml_str = convert_format(json_str, "json", "yaml")?;
//! ```
//!
//! ## Architecture
//!
//! The library follows Rust best practices with clear separation of concerns:
//! - **Core**: Basic parsing functions (this module)
//! - **Error**: Comprehensive error handling
//! - **Config**: Configuration management
//! - **Detection**: Format auto-detection
//! - **Streaming**: Async large file handling
//! - **Validation**: Schema validation
//! - **Performance**: Caching and optimization
//! - **Serialization**: Format output with options
//! - **Plugins**: Extensible parser system

#![deny(missing_docs)]
#![warn(clippy::all)]
#![allow(clippy::too_many_arguments)]

// Core library imports
use crate::prelude::*;
use napi_derive::napi;
use tracing::{info, debug, trace};

// Module declarations
mod error;
mod config;
mod telemetry;
mod app;
mod lib;

// Folder modules
mod components;
mod services;
mod adapters;
mod utils;
mod types;
mod constants;

// Public API re-exports
pub use error::{ParseError, Result, Format, LogLevel};
pub use config::Config;
pub use telemetry::init_telemetry;
pub use app::ParserApp;

// Component re-exports
pub use components::{detection::detect_format, validation::{SchemaValidator, validate_json_with_schema, json_schema, toml_schema}};

// Service re-exports
pub use services::{performance::{Cache, OptimizedParser, parse_json_zero_copy}, streaming::{StreamingParser, parse_large_file_async}};

// Adapter re-exports
pub use adapters::{plugins::{ParserPlugin, PluginRegistry, CsvPlugin, IniPlugin}, serialization::{SerializationOptions, Serializer, serialize_to_format}};

// Lib module re-exports
pub use lib::{parsing::{parse_json, parse_toml, parse_xml, parse_yaml, parse_auto}, 
                serialization::{serialize_to_json, serialize_to_toml, serialize_to_yaml},
                conversion::{convert_format, parse_async},
                metadata::{get_library_info, VERSION, NAME, DESCRIPTION}};

/// Library initialization
pub fn init() -> Result<()> {
    // Initialize tracing if not already set
    if tracing::subscriber::set_global_default(tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .finish()) 
        .is_err() 
    {
        // Subscriber already set, which is fine
    }
    
    tracing::info!("{} v{} initialized", NAME, VERSION);
    Ok(())
}

/// Basic JSON parsing function
#[napi]
pub fn parse_json(source: String) -> Result<serde_json::Value> {
    parsing::parse_json(source)
}

/// Basic TOML parsing function
#[napi]
pub fn parse_toml(source: String) -> Result<serde_json::Value> {
    parsing::parse_toml(source)
}

/// Basic XML parsing function
#[napi]
pub fn parse_xml(source: String) -> Result<serde_json::Value> {
    parsing::parse_xml(source)
}

/// Basic YAML parsing function
#[napi]
pub fn parse_yaml(source: String) -> Result<serde_json::Value> {
    parsing::parse_yaml(source)
}

/// Auto-detect format and parse
#[napi]
pub fn parse_auto(source: String) -> Result<serde_json::Value> {
    parsing::parse_auto(source)
}

/// Async file parsing with format specification
#[napi]
pub async fn parse_async(file_path: String, format: String) -> Result<serde_json::Value> {
    services::streaming::parse_large_file_async(&file_path, format).await
}

/// Parse with configuration options
#[napi]
pub fn parse_with_options(
    source: String, 
    format: String, 
    strict: Option<bool>, 
    security_enabled: Option<bool>
) -> Result<serde_json::Value> {
    parsing::parse_with_options(source, format, strict, security_enabled)
}

/// Serialize to JSON with pretty printing option
#[napi]
pub fn serialize_to_json(data: serde_json::Value, pretty: Option<bool>) -> Result<String> {
    serialization::serialize_to_json(data, pretty)
}

/// Serialize to TOML
#[napi]
pub fn serialize_to_toml(data: serde_json::Value) -> Result<String> {
    serialization::serialize_to_toml(data)
}

/// Serialize to YAML
#[napi]
pub fn serialize_to_yaml(data: serde_json::Value) -> Result<String> {
    serialization::serialize_to_yaml(data)
}

/// Convert between formats
#[napi]
pub fn convert_format(source: String, from: String, to: String) -> Result<String> {
    conversion::convert_format(source, from, to)
}

/// Get library information
#[napi]
pub fn get_library_info() -> serde_json::Value {
    metadata::get_library_info()
}

#[cfg(test)]
mod tests;
