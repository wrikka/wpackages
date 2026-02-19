//! Core parsing functionality
//!
//! This module provides the main parsing functions for all supported formats.

use crate::prelude::*;
use napi_derive::napi;
use tracing::{info, debug, trace};
use crate::components::detection::detect_format;
use crate::services::performance::OptimizedParser;
use crate::adapters::serialization::serialize_to_format;

/// Basic JSON parsing function
#[napi]
pub fn parse_json(source: String) -> Result<serde_json::Value> {
    trace!("Parsing JSON input ({} bytes)", source.len());
    let result = serde_json::from_str(&source)
        .map_err(ParseError::Json)?;
    debug!("JSON parsing successful");
    Ok(result)
}

/// Basic TOML parsing function
#[napi]
pub fn parse_toml(source: String) -> Result<serde_json::Value> {
    trace!("Parsing TOML input ({} bytes)", source.len());
    let result = toml::from_str(&source)
        .map_err(ParseError::Toml)?;
    debug!("TOML parsing successful");
    Ok(result)
}

/// Basic XML parsing function
#[napi]
pub fn parse_xml(source: String) -> Result<serde_json::Value> {
    trace!("Parsing XML input ({} bytes)", source.len());
    let result = quick_xml::de::from_str(&source)
        .map_err(ParseError::Xml)?;
    debug!("XML parsing successful");
    Ok(result)
}

/// Basic YAML parsing function
#[napi]
pub fn parse_yaml(source: String) -> Result<serde_json::Value> {
    trace!("Parsing YAML input ({} bytes)", source.len());
    let result = serde_yaml::from_str(&source)
        .map_err(ParseError::Yaml)?;
    debug!("YAML parsing successful");
    Ok(result)
}

/// Auto-detect format and parse
#[napi]
pub fn parse_auto(source: String) -> Result<serde_json::Value> {
    info!("Auto-detecting format for input ({} bytes)", source.len());
    let format = detect_format(&source)?;
    info!("Detected format: {:?}", format);
    
    match format {
        Format::Json => parse_json(source),
        Format::Toml => parse_toml(source),
        Format::Xml => parse_xml(source),
        Format::Yaml => parse_yaml(source),
    }
}
