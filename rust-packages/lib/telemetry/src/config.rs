use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryConfig {
    pub service_name: String,
    pub environment: String,
    pub log_level: String,
    pub log_format: LogFormat,
    pub sentry: Option<SentryConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SentryConfig {
    pub dsn: String,
    pub sample_rate: f32,
    pub traces_sample_rate: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogFormat {
    Pretty,
    Json,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            service_name: "wai-service".to_string(),
            environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            log_format: if std::env::var("ENVIRONMENT").unwrap_or_default() == "production" {
                LogFormat::Json
            } else {
                LogFormat::Pretty
            },
            sentry: std::env::var("SENTRY_DSN").ok().map(|dsn| SentryConfig {
                dsn,
                sample_rate: std::env::var("SENTRY_SAMPLE_RATE")
                    .ok()
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(1.0),
                traces_sample_rate: std::env::var("SENTRY_TRACES_SAMPLE_RATE")
                    .ok()
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(0.1),
            }),
        }
    }
}
