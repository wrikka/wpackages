//! Serialization functionality
//!
//! This module provides serialization functions for all supported formats.

use crate::prelude::*;
use napi_derive::napi;
use tracing::{trace, debug};
use crate::adapters::serialization::SerializationOptions;

/// Serialize to JSON with pretty printing option
#[napi]
pub fn serialize_to_json(data: serde_json::Value, pretty: Option<bool>) -> Result<String> {
    trace!("Serializing to JSON (pretty: {:?})", pretty);
    let result = if pretty.unwrap_or(false) {
        serde_json::to_string_pretty(&data).map_err(ParseError::Json)?
    } else {
        serde_json::to_string(&data).map_err(ParseError::Json)?
    };
    debug!("JSON serialization successful ({} bytes)", result.len());
    Ok(result)
}

/// Serialize to TOML
#[napi]
pub fn serialize_to_toml(data: serde_json::Value) -> Result<String> {
    trace!("Serializing to TOML");
    let result = toml::to_string_pretty(&data)
        .map_err(|e| ParseError::Toml(toml::de::Error::custom(e.to_string(), None)))?;
    debug!("TOML serialization successful ({} bytes)", result.len());
    Ok(result)
}

/// Serialize to YAML
#[napi]
pub fn serialize_to_yaml(data: serde_json::Value) -> Result<String> {
    trace!("Serializing to YAML");
    let result = serde_yaml::to_string(&data).map_err(ParseError::Yaml)?;
    debug!("YAML serialization successful ({} bytes)", result.len());
    Ok(result)
}
