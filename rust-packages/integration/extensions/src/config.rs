use crate::error::Result;
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct AppConfig {
    pub extension_dirs: Vec<String>,
    #[serde(default)]
    pub disabled_extensions: Vec<String>,
    pub storage_dir: String,
}

impl AppConfig {
    pub fn save(&self) -> Result<()> {
        let toml_string = toml::to_string_pretty(self).expect("Failed to serialize config");
        std::fs::write("Config.toml", toml_string)?;
        Ok(())
    }

    pub fn load() -> Result<Self> {
        let config: AppConfig = Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("WEXT_"))
            .extract()?;
        Ok(config)
    }
}
