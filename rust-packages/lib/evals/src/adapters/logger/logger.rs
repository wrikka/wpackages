//! Structured logger adapter

use tracing::{info, warn, error, debug, trace};
use serde::{Deserialize, Serialize};

/// Log level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    /// Convert to tracing level
    pub fn to_tracing_level(self) -> tracing::Level {
        match self {
            LogLevel::Trace => tracing::Level::TRACE,
            LogLevel::Debug => tracing::Level::DEBUG,
            LogLevel::Info => tracing::Level::INFO,
            LogLevel::Warn => tracing::Level::WARN,
            LogLevel::Error => tracing::Level::ERROR,
        }
    }

    /// Parse from string
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "trace" => Some(LogLevel::Trace),
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        }
    }
}

/// Structured logger adapter
pub struct Logger {
    component: String,
}

impl Logger {
    /// Create a new logger for a component
    pub fn new(component: String) -> Self {
        Self { component }
    }

    /// Log trace message
    pub fn trace(&self, message: &str, fields: &[(&str, &dyn std::fmt::Display)]) {
        let span = tracing::span!(
            tracing::Level::TRACE,
            component = %self.component,
        );
        let _enter = span.enter();

        let mut f = tracing::field::FieldSet::from_iter(fields.iter().map(|(k, _)| *k));
        let mut values = tracing::field::ValueSet::new(&f).unwrap();

        for (key, value) in fields {
            values.record_field(&f.field(key).unwrap(), value);
        }

        trace!(message, ?values);
    }

    /// Log debug message
    pub fn debug(&self, message: &str, fields: &[(&str, &dyn std::fmt::Display)]) {
        let span = tracing::span!(
            tracing::Level::DEBUG,
            component = %self.component,
        );
        let _enter = span.enter();

        let mut f = tracing::field::FieldSet::from_iter(fields.iter().map(|(k, _)| *k));
        let mut values = tracing::field::ValueSet::new(&f).unwrap();

        for (key, value) in fields {
            values.record_field(&f.field(key).unwrap(), value);
        }

        debug!(message, ?values);
    }

    /// Log info message
    pub fn info(&self, message: &str, fields: &[(&str, &dyn std::fmt::Display)]) {
        let span = tracing::span!(
            tracing::Level::INFO,
            component = %self.component,
        );
        let _enter = span.enter();

        let mut f = tracing::field::FieldSet::from_iter(fields.iter().map(|(k, _)| *k));
        let mut values = tracing::field::ValueSet::new(&f).unwrap();

        for (key, value) in fields {
            values.record_field(&f.field(key).unwrap(), value);
        }

        info!(message, ?values);
    }

    /// Log warning message
    pub fn warn(&self, message: &str, fields: &[(&str, &dyn std::fmt::Display)]) {
        let span = tracing::span!(
            tracing::Level::WARN,
            component = %self.component,
        );
        let _enter = span.enter();

        let mut f = tracing::field::FieldSet::from_iter(fields.iter().map(|(k, _)| *k));
        let mut values = tracing::field::ValueSet::new(&f).unwrap();

        for (key, value) in fields {
            values.record_field(&f.field(key).unwrap(), value);
        }

        warn!(message, ?values);
    }

    /// Log error message
    pub fn error(&self, message: &str, fields: &[(&str, &dyn std::fmt::Display)]) {
        let span = tracing::span!(
            tracing::Level::ERROR,
            component = %self.component,
        );
        let _enter = span.enter();

        let mut f = tracing::field::FieldSet::from_iter(fields.iter().map(|(k, _)| *k));
        let mut values = tracing::field::ValueSet::new(&f).unwrap();

        for (key, value) in fields {
            values.record_field(&f.field(key).unwrap(), value);
        }

        error!(message, ?values);
    }

    /// Log evaluation start
    pub fn log_eval_start(&self, eval_id: &str, name: &str, sample_count: usize) {
        self.info(
            "Starting evaluation",
            &[
                ("eval_id", &eval_id),
                ("name", &name),
                ("sample_count", &sample_count),
            ],
        );
    }

    /// Log evaluation completion
    pub fn log_eval_complete(
        &self,
        eval_id: &str,
        duration_ms: u64,
        total_samples: usize,
        passed_samples: usize,
    ) {
        let pass_rate = if total_samples > 0 {
            passed_samples as f64 / total_samples as f64
        } else {
            0.0
        };

        self.info(
            "Evaluation completed",
            &[
                ("eval_id", &eval_id),
                ("duration_ms", &duration_ms),
                ("total_samples", &total_samples),
                ("passed_samples", &passed_samples),
                ("pass_rate", &pass_rate),
            ],
        );
    }

    /// Log evaluation error
    pub fn log_eval_error(&self, eval_id: &str, error: &str) {
        self.error(
            "Evaluation failed",
            &[("eval_id", &eval_id), ("error", &error)],
        );
    }

    /// Log sample evaluation
    pub fn log_sample_eval(
        &self,
        eval_id: &str,
        sample_id: &str,
        score: f64,
        passed: bool,
        latency_ms: u64,
    ) {
        self.debug(
            "Sample evaluated",
            &[
                ("eval_id", &eval_id),
                ("sample_id", &sample_id),
                ("score", &score),
                ("passed", &passed),
                ("latency_ms", &latency_ms),
            ],
        );
    }
}
