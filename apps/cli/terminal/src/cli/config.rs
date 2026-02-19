use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct MarketplaceConfig {
    pub url: String,
    pub api_key: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct BuildConfig {
    pub target: Option<String>,
    pub release: bool,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    pub marketplace: MarketplaceConfig,
    pub build: BuildConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("WTERMINAL_").split("__"))
            .extract()
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            marketplace: MarketplaceConfig {
                url: "https://marketplace.wterminal.io".to_string(),
                api_key: None,
            },
            build: BuildConfig {
                target: None,
                release: false,
            },
        }
    }
}
