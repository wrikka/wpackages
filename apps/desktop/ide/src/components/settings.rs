use crate::config::app_config::{self, AppConfig};

pub fn validate_json(json_string: &str) -> Result<AppConfig, String> {
    app_config::parse_json(json_string)
}

pub fn config_to_json(config: &AppConfig) -> String {
    app_config::to_pretty_json(config)
}
