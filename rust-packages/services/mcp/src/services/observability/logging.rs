use tracing::{info, warn, error, debug};
use tracing_subscriber::{EnvFilter, fmt, prelude::*};
use std::sync::atomic::{AtomicU64, Ordering};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone)]
pub struct LogConfig {
    pub level: LogLevel,
    pub json_format: bool,
    pub include_source: bool,
    pub include_target: bool,
}

impl Default for LogConfig {
    fn default() -> Self {
        Self {
            level: LogLevel::Info,
            json_format: false,
            include_source: true,
            include_target: true,
        }
    }
}

static REQUEST_ID: AtomicU64 = AtomicU64::new(0);

pub fn init_logging(config: LogConfig) {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(config.level.as_str()));

    let fmt_layer = fmt::layer()
        .with_target(config.include_target)
        .with_file(config.include_source)
        .with_line_number(config.include_source);

    let subscriber = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);

    tracing::subscriber::set_global_default(subscriber)
        .expect("Unable to set global subscriber");

    info!("Logging initialized with level: {:?}", config.level);
}

pub fn generate_request_id() -> u64 {
    REQUEST_ID.fetch_add(1, Ordering::SeqCst)
}

impl LogLevel {
    fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Trace => "trace",
            LogLevel::Debug => "debug",
            LogLevel::Info => "info",
            LogLevel::Warn => "warn",
            LogLevel::Error => "error",
        }
    }
}

pub fn log_with_context(level: LogLevel, message: &str, context: &[(String, String)]) {
    let request_id = generate_request_id();
    
    let span = tracing::span!(
        tracing::Level::INFO,
        "request",
        request_id = request_id
    );

    let _enter = span.enter();

    let mut log_message = format!("[request_id={}] {}", request_id, message);
    
    for (key, value) in context {
        log_message.push_str(&format!(" {}={}", key, value));
    }

    match level {
        LogLevel::Trace => tracing::trace!("{}", log_message),
        LogLevel::Debug => tracing::debug!("{}", log_message),
        LogLevel::Info => info!("{}", log_message),
        LogLevel::Warn => warn!("{}", log_message),
        LogLevel::Error => error!("{}", log_message),
    }
}
