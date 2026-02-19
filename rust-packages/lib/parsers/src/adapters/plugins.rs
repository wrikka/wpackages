use crate::error::{ParseError, Result};
use serde_json::Value;

pub trait ParserPlugin {
    fn name(&self) -> &str;
    fn can_parse(&self, input: &str) -> bool;
    fn parse(&self, input: &str) -> Result<Value>;
    fn serialize(&self, data: &Value) -> Result<String>;
}

pub struct PluginRegistry {
    plugins: Vec<Box<dyn ParserPlugin + Send + Sync>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            plugins: Vec::new(),
        }
    }

    pub fn register(&mut self, plugin: Box<dyn ParserPlugin + Send + Sync>) {
        self.plugins.push(plugin);
    }

    pub fn find_parser(&self, input: &str) -> Option<&dyn ParserPlugin> {
        for plugin in &self.plugins {
            if plugin.can_parse(input) {
                return Some(plugin.as_ref());
            }
        }
        None
    }

    pub fn parse_with_plugins(&self, input: &str) -> Result<Value> {
        if let Some(parser) = self.find_parser(input) {
            parser.parse(input)
        } else {
            Err(ParseError::Detection("No plugin found for input".to_string()))
        }
    }
}

// Example plugin for CSV
pub struct CsvPlugin;

impl ParserPlugin for CsvPlugin {
    fn name(&self) -> &str {
        "csv"
    }

    fn can_parse(&self, input: &str) -> bool {
        // Simple CSV detection
        input.lines().take(5).all(|line| line.split(',').count() > 1)
    }

    fn parse(&self, input: &str) -> Result<Value> {
        let mut result = serde_json::Array::new();
        
        for line in input.lines() {
            let fields: Vec<Value> = line
                .split(',')
                .map(|field| Value::String(field.trim().to_string()))
                .collect();
            result.push(Value::Array(fields));
        }
        
        Ok(Value::Array(result))
    }

    fn serialize(&self, data: &Value) -> Result<String> {
        match data {
            Value::Array(arr) => {
                let mut result = String::new();
                for row in arr {
                    if let Value::Array(fields) = row {
                        let csv_row: Vec<String> = fields
                            .iter()
                            .map(|field| match field {
                                Value::String(s) => s.clone(),
                                _ => field.to_string(),
                            })
                            .collect();
                        result.push_str(&csv_row.join(","));
                        result.push('\n');
                    }
                }
                Ok(result)
            }
            _ => Err(ParseError::Plugin("CSV plugin can only serialize arrays".to_string())),
        }
    }
}

// Example plugin for INI files
pub struct IniPlugin;

impl ParserPlugin for IniPlugin {
    fn name(&self) -> &str {
        "ini"
    }

    fn can_parse(&self, input: &str) -> bool {
        input.lines().any(|line| {
            let trimmed = line.trim();
            trimmed.contains('=') && !trimmed.starts_with('#') && !trimmed.starts_with(';')
        })
    }

    fn parse(&self, input: &str) -> Result<Value> {
        let mut result = serde_json::Map::new();
        
        for line in input.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
                continue;
            }
            
            if let Some((key, value)) = trimmed.split_once('=') {
                result.insert(
                    key.trim().to_string(),
                    Value::String(value.trim().to_string()),
                );
            }
        }
        
        Ok(Value::Object(result))
    }

    fn serialize(&self, data: &Value) -> Result<String> {
        match data {
            Value::Object(map) => {
                let mut result = String::new();
                for (key, value) in map {
                    let value_str = match value {
                        Value::String(s) => s.clone(),
                        _ => value.to_string(),
                    };
                    result.push_str(&format!("{} = {}\n", key, value_str));
                }
                Ok(result)
            }
            _ => Err(ParseError::Plugin("INI plugin can only serialize objects".to_string())),
        }
    }
}
