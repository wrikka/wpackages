use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationConfig {
    pub max_depth: usize,
    pub max_string_length: usize,
    pub max_array_length: usize,
    pub enable_zero_copy: bool,
}

impl Default for ValidationConfig {
    fn default() -> Self {
        Self {
            max_depth: 10,
            max_string_length: 10000,
            max_array_length: 1000,
            enable_zero_copy: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub parallel_validation: bool,
    pub cache_validators: bool,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            parallel_validation: true,
            cache_validators: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorConfig {
    pub include_context: bool,
    pub include_path: bool,
    pub include_value: bool,
}

impl Default for ErrorConfig {
    fn default() -> Self {
        Self {
            include_context: true,
            include_path: true,
            include_value: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SchemaConfig {
    pub validation: ValidationConfig,
    pub performance: PerformanceConfig,
    pub error: ErrorConfig,
}

impl SchemaConfig {
    pub fn load() -> Result<Self, Box<figment::Error>> {
        Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("SCHEMA_").split("__"))
            .extract()
            .map_err(Box::new)
    }

    pub fn from_file(path: &str) -> Result<Self, Box<figment::Error>> {
        Figment::new()
            .merge(Toml::file(path))
            .extract()
            .map_err(Box::new)
    }
}
