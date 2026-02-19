use crate::error::{ParseError, Result};
use crate::Format;
use memchr::{memchr, memmem};
use std::path::Path;

pub fn detect_format(input: &str) -> Result<Format> {
    let trimmed = input.trim_start();
    
    if trimmed.is_empty() {
        return Err(ParseError::Detection("Empty input".to_string()));
    }

    // Check for JSON
    if let Some(first_char) = trimmed.chars().next() {
        if first_char == '{' || first_char == '[' {
            // Additional validation for JSON
            if is_likely_json(trimmed) {
                return Ok(Format::Json);
            }
        }
    }

    // Check for XML
    if trimmed.starts_with('<') {
        if is_likely_xml(trimmed) {
            return Ok(Format::Xml);
        }
    }

    // Check for YAML
    if is_likely_yaml(trimmed) {
        return Ok(Format::Yaml);
    }

    // Check for TOML
    if is_likely_toml(trimmed) {
        return Ok(Format::Toml);
    }

    Err(ParseError::Detection("Unable to detect format".to_string()))
}

pub async fn detect_format_from_file(file_path: &str) -> Result<Format> {
    let content = tokio::fs::read_to_string(file_path).await?;
    
    // Try to detect from file extension first
    if let Some(extension) = Path::new(file_path).extension().and_then(|ext| ext.to_str()) {
        match extension.to_lowercase().as_str() {
            "json" => return Ok(Format::Json),
            "toml" => return Ok(Format::Toml),
            "xml" => return Ok(Format::Xml),
            "yaml" | "yml" => return Ok(Format::Yaml),
            _ => {}
        }
    }
    
    // Fall back to content detection
    detect_format(&content)
}

fn is_likely_json(input: &str) -> bool {
    let mut brace_count = 0;
    let mut bracket_count = 0;
    let in_string = false;
    
    for ch in input.chars() {
        match ch {
            '{' if !in_string => brace_count += 1,
            '}' if !in_string => brace_count -= 1,
            '[' if !in_string => bracket_count += 1,
            ']' if !in_string => bracket_count -= 1,
            '"' => return !in_string, // Simplified string detection
            _ => {}
        }
    }
    
    brace_count == 0 && bracket_count == 0
}

fn is_likely_xml(input: &str) -> bool {
    let trimmed = input.trim_start();
    trimmed.starts_with("<?xml") || 
    (trimmed.starts_with('<') && trimmed.contains('>') && trimmed.contains("</"))
}

fn is_likely_yaml(input: &str) -> bool {
    // YAML typically has key: value pairs or list items with dashes
    input.lines().any(|line| {
        let trimmed = line.trim();
        trimmed.contains(':') && !trimmed.starts_with('#') || 
        trimmed.starts_with('-') ||
        trimmed.starts_with("---")
    })
}

fn is_likely_toml(input: &str) -> bool {
    // TOML has sections like [section] and key = value pairs
    input.lines().any(|line| {
        let trimmed = line.trim();
        (trimmed.starts_with('[') && trimmed.ends_with(']')) ||
        (trimmed.contains('=') && !trimmed.starts_with('#'))
    })
}
