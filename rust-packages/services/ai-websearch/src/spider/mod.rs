pub mod runner;

use serde::Deserialize;
use url::Url;

#[derive(Debug, Deserialize)]
pub struct SpiderConfig {
    pub name: String,
    pub start_urls: Vec<Url>,
    pub rules: Vec<Rule>,
    #[serde(default)]
    pub settings: SpiderSettings,
}

#[derive(Debug, Deserialize)]
pub struct Rule {
    pub link_extractor: LinkExtractor,
    pub callback: String, // For now, just a name. Later could be a script or wasm module.
    #[serde(default)]
    pub follow: bool,
}

#[derive(Debug, Deserialize)]
pub struct LinkExtractor {
    #[serde(default)]
    pub allow: Vec<String>, // Regex patterns
    #[serde(default)]
    pub deny: Vec<String>, // Regex patterns
    #[serde(default)]
    pub restrict_css: Vec<String>, // CSS selectors
}

#[derive(Debug, Deserialize, Default)]
pub struct SpiderSettings {
    pub user_agent: Option<String>,
    pub download_delay_ms: Option<u64>,
}
