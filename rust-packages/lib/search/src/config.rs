use serde::{Deserialize, Serialize};
use figment::{Figment, providers::{Format, Toml, Env}};
use std::path::PathBuf;

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Config {
    pub search: Option<SearchConfig>,
    pub semantic: Option<SemanticConfig>,
    pub index: Option<IndexConfig>,
    pub lsp: Option<LspConfig>,
    pub query: Option<QueryConfig>,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SearchConfig {
    pub default_root: Option<String>,
    pub default_limit: Option<usize>,
    pub case_sensitive: Option<bool>,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SemanticConfig {
    pub embeddings_url: Option<String>,
    pub cache_enabled: Option<bool>,
    pub cache_path: Option<String>,
    pub index_enabled: Option<bool>,
    pub index_path: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct IndexConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_index_path")]
    pub path: PathBuf,
    #[serde(default = "default_watch")]
    pub watch: bool,
    #[serde(default = "default_persist")]
    pub persist: bool,
    #[serde(default = "default_debounce_ms")]
    pub debounce_ms: u64,
}

impl Default for IndexConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            path: default_index_path(),
            watch: true,
            persist: true,
            debounce_ms: default_debounce_ms(),
        }
    }
}

fn default_index_path() -> PathBuf {
    PathBuf::from(".codesearch/index")
}

fn default_watch() -> bool {
    true
}

fn default_persist() -> bool {
    true
}

fn default_debounce_ms() -> u64 {
    500
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LspConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub servers: std::collections::HashMap<String, LspServerConfig>,
    #[serde(default = "default_timeout_ms")]
    pub timeout_ms: u64,
}

impl Default for LspConfig {
    fn default() -> Self {
        let mut servers = std::collections::HashMap::new();
        servers.insert("rust".to_string(), LspServerConfig {
            command: "rust-analyzer".to_string(),
            args: vec![],
        });
        servers.insert("typescript".to_string(), LspServerConfig {
            command: "typescript-language-server".to_string(),
            args: vec!["--stdio".to_string()],
        });
        
        Self {
            enabled: true,
            servers,
            timeout_ms: default_timeout_ms(),
        }
    }
}

fn default_timeout_ms() -> u64 {
    5000
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LspServerConfig {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct QueryConfig {
    #[serde(default = "default_query_limit")]
    pub default_limit: usize,
    #[serde(default)]
    pub enable_cache: bool,
    #[serde(default = "default_cache_size")]
    pub cache_size: usize,
}

impl Default for QueryConfig {
    fn default() -> Self {
        Self {
            default_limit: default_query_limit(),
            enable_cache: true,
            cache_size: default_cache_size(),
        }
    }
}

fn default_query_limit() -> usize {
    100
}

fn default_cache_size() -> usize {
    1000
}

pub fn load() -> Result<Config, figment::Error> {
    Figment::new()
        .merge(Toml::file(".codesearch.toml"))
        .merge(Env::prefixed("CODESEARCH_"))
        .extract()
}

pub fn load_with_path(path: &str) -> Result<Config, figment::Error> {
    Figment::new()
        .merge(Toml::file(path))
        .merge(Env::prefixed("CODESEARCH_"))
        .extract()
}
