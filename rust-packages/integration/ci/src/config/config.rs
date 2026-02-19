use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct GitHubConfig {
    pub token: String,
    pub owner: String,
    pub repo: String,
}

#[derive(Deserialize, Debug)]
pub struct CiCdConfig {
    pub github: GitHubConfig,
}

impl CiCdConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("CICD_").split("__"))
            .extract()
    }
}
