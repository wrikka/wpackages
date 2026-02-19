//! Format conversion functionality
//!
//! This module provides conversion between different data formats.

use crate::prelude::*;
use napi_derive::napi;
use tracing::info;
use crate::lib::parsing::{parse_json, parse_toml, parse_xml, parse_yaml};
use crate::lib::serialization::{serialize_to_json, serialize_to_toml, serialize_to_yaml};
use crate::adapters::serialization::serialize_to_format;
use crate::Format;

/// Convert between formats
#[napi]
pub fn convert_format(source: String, from: String, to: String) -> Result<String> {
    info!("Converting from '{}' to '{}'", from, to);
    
    let from_format = Format::from_str(&from)?;
    let to_format = Format::from_str(&to)?;
    
    // Parse source format
    let parsed = match from_format {
        Format::Json => parse_json(source)?,
        Format::Toml => parse_toml(source)?,
        Format::Xml => parse_xml(source)?,
        Format::Yaml => parse_yaml(source)?,
    };
    
    // Serialize to target format
    let result = serialize_to_format(&parsed, to_format, None)?;
    info!("Format conversion successful ({} bytes)", result.len());
    Ok(result)
}

/// Async file parsing with format specification
#[napi]
pub async fn parse_async(file_path: String, format: String) -> Result<serde_json::Value> {
    info!("Parsing file '{}' with format '{}'", file_path, format);
    let format_enum = Format::from_str(&format)?;
    crate::services::streaming::parse_large_file_async(&file_path, format_enum).await
}
