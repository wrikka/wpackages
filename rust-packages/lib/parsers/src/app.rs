use crate::{
    error::{ParseError, Result},
    Format,
    components::{detection, validation},
    services::{performance, streaming},
    adapters::{plugins, serialization},
    telemetry,
};
use serde_json::Value;

pub struct ParserApp {
    optimized_parser: performance::OptimizedParser,
    plugin_registry: plugins::PluginRegistry,
}

impl ParserApp {
    pub fn new(cache_ttl_seconds: u64) -> Self {
        telemetry::init_telemetry();
        
        Self {
            optimized_parser: performance::OptimizedParser::new(cache_ttl_seconds),
            plugin_registry: plugins::PluginRegistry::new(),
        }
    }

    pub fn with_plugins(mut self, plugins: Vec<Box<dyn plugins::ParserPlugin + Send + Sync>>) -> Self {
        for plugin in plugins {
            let plugin_name = plugin.name();
            self.plugin_registry.register(plugin);
            telemetry::log_plugin_registered(plugin_name);
        }
        self
    }

    pub async fn parse_auto_detect(&self, input: &str) -> Result<Value> {
        let start = std::time::Instant::now();
        
        let format = detection::detect_format(input)?;
        let result = self.parse_with_format(input, format).await?;
        
        let duration = start.elapsed().as_millis() as u64;
        telemetry::log_parse_operation(&format!("{:?}", format), input.len(), duration);
        
        Ok(result)
    }

    pub async fn parse_with_format(&self, input: &str, format: Format) -> Result<Value> {
        self.optimized_parser.parse_with_cache(input, format).await
    }

    pub async fn parse_with_plugins(&self, input: &str) -> Result<Value> {
        let start = std::time::Instant::now();
        
        let result = self.plugin_registry.parse_with_plugins(input)?;
        
        let duration = start.elapsed().as_millis() as u64;
        telemetry::log_parse_operation("plugin", input.len(), duration);
        
        Ok(result)
    }

    pub async fn parse_large_file(&self, file_path: &str) -> Result<Value> {
        let format = detection::detect_format_from_file(file_path).await?;
        streaming::parse_large_file_async(file_path, format).await
    }

    pub fn validate_with_schema(&self, data: &Value, schema: &Value) -> Result<()> {
        validation::validate_json_with_schema(data, schema)
    }

    pub fn serialize_to_format(
        &self,
        data: &Value,
        format: Format,
        options: Option<&serialization::SerializationOptions>,
    ) -> Result<String> {
        serialization::serialize_to_format(data, format, options)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::plugins::{CsvPlugin, IniPlugin};

    #[tokio::test]
    async fn test_auto_detect_parsing() {
        let app = ParserApp::new(3600);
        let json_input = r#"{"name": "test", "value": 42}"#;
        
        let result = app.parse_auto_detect(json_input).await.unwrap();
        assert_eq!(result["name"], "test");
        assert_eq!(result["value"], 42);
    }

    #[tokio::test]
    async fn test_plugin_parsing() {
        let csv_plugin = Box::new(CsvPlugin);
        let ini_plugin = Box::new(IniPlugin);
        
        let app = ParserApp::new(3600)
            .with_plugins(vec![csv_plugin, ini_plugin]);
        
        let csv_input = "name,age\nJohn,30\nJane,25";
        let result = app.parse_with_plugins(csv_input).await.unwrap();
        
        assert!(result.is_array());
        assert_eq!(result.as_array().unwrap().len(), 2);
    }
}
