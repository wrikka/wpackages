use crate::error::{ParseError, Result};
use crate::Format;
use serde_json::Value;
use std::collections::HashMap;
use serde_core::ser::Error as SerError;

pub struct SerializationOptions {
    pub indent: Option<usize>,
    pub sort_keys: bool,
    pub preserve_order: bool,
}

impl Default for SerializationOptions {
    fn default() -> Self {
        Self {
            indent: Some(2),
            sort_keys: false,
            preserve_order: true,
        }
    }
}

pub trait Serializer {
    fn serialize(&self, data: &Value, options: &SerializationOptions) -> Result<String>;
}

pub struct JsonSerializer;

impl Serializer for JsonSerializer {
    fn serialize(&self, data: &Value, options: &SerializationOptions) -> Result<String> {
        if options.sort_keys {
            let sorted = sort_json_keys(data.clone());
            if options.indent.is_some() {
                serde_json::to_string_pretty(&sorted).map_err(ParseError::Json)
            } else {
                serde_json::to_string(&sorted).map_err(ParseError::Json)
            }
        } else if options.indent.is_some() {
            serde_json::to_string_pretty(data).map_err(ParseError::Json)
        } else {
            serde_json::to_string(data).map_err(ParseError::Json)
        }
    }
}

pub struct TomlSerializer;

impl Serializer for TomlSerializer {
    fn serialize(&self, data: &Value, options: &SerializationOptions) -> Result<String> {
        // TOML doesn't have built-in pretty printing, so we convert to JSON first
        let json_str = JsonSerializer.serialize(data, options)?;
        let json_value: Value = serde_json::from_str(&json_str).map_err(ParseError::Json)?;
        toml::to_string_pretty(&json_value)
            .map_err(|e| ParseError::Toml(toml::de::Error::custom(e.to_string(), None)))
    }
}

pub struct XmlSerializer;

impl Serializer for XmlSerializer {
    fn serialize(&self, data: &Value, _options: &SerializationOptions) -> Result<String> {
        // Quick-xml serialization is complex, so we'll do a basic implementation
        serialize_xml_to_string(data)
    }
}

pub struct YamlSerializer;

impl Serializer for YamlSerializer {
    fn serialize(&self, data: &Value, options: &SerializationOptions) -> Result<String> {
        if options.sort_keys {
            let sorted = sort_json_keys(data.clone());
            serde_yaml::to_string(&sorted).map_err(ParseError::Yaml)
        } else {
            serde_yaml::to_string(data).map_err(ParseError::Yaml)
        }
    }
}

fn sort_json_keys(value: Value) -> Value {
    match value {
        Value::Object(mut map) => {
            let mut sorted_map = serde_json::Map::new();
            let mut keys: Vec<String> = map.keys().cloned().collect();
            keys.sort();
            for key in keys {
                let val = map.remove(&key).unwrap();
                sorted_map.insert(key, sort_json_keys(val));
            }
            Value::Object(sorted_map)
        }
        Value::Array(arr) => {
            let sorted_arr: Vec<Value> = arr.into_iter().map(sort_json_keys).collect();
            Value::Array(sorted_arr)
        }
        _ => value,
    }
}

fn serialize_xml_to_string(data: &Value) -> Result<String> {
    match data {
        Value::Object(map) => {
            let mut result = String::new();
            for (key, value) in map {
                result.push_str(&format!("<{}>", key));
                result.push_str(&serialize_xml_to_string(value)?);
                result.push_str(&format!("</{}>", key));
            }
            Ok(result)
        }
        Value::String(s) => Ok(s.clone()),
        Value::Number(n) => Ok(n.to_string()),
        Value::Bool(b) => Ok(b.to_string()),
        Value::Null => Ok(String::new()),
        Value::Array(arr) => {
            let mut result = String::new();
            for item in arr {
                result.push_str("<item>");
                result.push_str(&serialize_xml_to_string(item)?);
                result.push_str("</item>");
            }
            Ok(result)
        }
    }
}

pub fn serialize_to_format(
    data: &Value,
    format: crate::Format,
    options: Option<&SerializationOptions>,
) -> Result<String> {
    let default_opts = SerializationOptions::default();
    let opts = options.unwrap_or(&default_opts);
    
    match format {
        crate::Format::Json => JsonSerializer.serialize(data, opts),
        crate::Format::Toml => TomlSerializer.serialize(data, opts),
        crate::Format::Xml => XmlSerializer.serialize(data, opts),
        crate::Format::Yaml => YamlSerializer.serialize(data, opts),
    }
}
