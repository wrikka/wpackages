//! Telemetry initialization for the effect library.
//!
//! This module provides a flexible builder for setting up logging and tracing
//! with support for different formats and optional OpenTelemetry integration.

use tracing_subscriber::{
    fmt::format::FmtSpan, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer, Registry,
};

/// Defines the format for log output.
pub enum LogFormat {
    /// Human-readable, pretty-printed format.
    Pretty,
    /// Machine-readable JSON format.
    Json,
}

/// A builder for configuring and initializing the telemetry subscriber.
pub struct TelemetryBuilder {
    service_name: String,
    log_format: LogFormat,
}

impl Default for TelemetryBuilder {
    fn default() -> Self {
        Self {
            service_name: "effect_app".into(),
            log_format: LogFormat::Pretty,
        }
    }
}

impl TelemetryBuilder {
    /// Creates a new `TelemetryBuilder` with default settings.
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the service name for telemetry identification.
    pub fn with_service_name(mut self, service_name: impl Into<String>) -> Self {
        self.service_name = service_name.into();
        self
    }

    /// Sets the log output format.
    pub fn with_log_format(mut self, format: LogFormat) -> Self {
        self.log_format = format;
        self
    }

    /// Initializes the global tracing subscriber with the configured settings.
    pub fn build(self) {
        let env_filter =
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

        let logging_layer = match self.log_format {
            LogFormat::Pretty => tracing_subscriber::fmt::layer()
                .with_span_events(FmtSpan::FULL)
                .pretty()
                .boxed(),
            LogFormat::Json => tracing_subscriber::fmt::layer()
                .with_span_events(FmtSpan::FULL)
                .json()
                .boxed(),
        };

        let registry = Registry::default().with(env_filter).with(logging_layer);

        // Conditionally add the OpenTelemetry layer if the feature is enabled
        #[cfg(feature = "telemetry-otlp")]
        {
            use opentelemetry::global;
            use opentelemetry_sdk::propagation::TraceContextPropagator;
            use tracing_opentelemetry::OpenTelemetryLayer;

            global::set_text_map_propagator(TraceContextPropagator::new());

            let tracer = opentelemetry_otlp::new_pipeline()
                .tracing()
                .with_exporter(
                    opentelemetry_otlp::new_exporter()
                        .tonic()
                        .with_endpoint("http://localhost:4317"),
                )
                .with_sdk_config(opentelemetry_sdk::trace::Config::default().with_resource(
                    opentelemetry_sdk::Resource::new(vec![opentelemetry::KeyValue::new(
                        "service.name",
                        self.service_name,
                    )]),
                ))
                .install_batch(opentelemetry_sdk::runtime::Tokio)
                .expect("Failed to initialize OTLP tracer");

            let otel_layer = OpenTelemetryLayer::new(tracer);
            registry.with(otel_layer).init();
        }

        // If the OTLP feature is not enabled, initialize without it
        #[cfg(not(feature = "telemetry-otlp"))]
        {
            registry.init();
        }
    }
}

/// A simple initialization function for convenience, using the builder with defaults.
pub fn init_subscriber() {
    TelemetryBuilder::new().build();
}

/// Initializes and installs a Prometheus recorder for the `metrics` facade.
///
/// This function should be called once at the beginning of the application's lifecycle.
/// It sets up an exporter that makes metrics available on a `/metrics` endpoint.
///
/// **Note:** This function is only available when the `metrics-prometheus` feature is enabled.
#[cfg(feature = "metrics-prometheus")]
pub fn init_prometheus_recorder() {
    use metrics_exporter_prometheus::PrometheusBuilder;

    PrometheusBuilder::new()
        .install()
        .expect("Failed to install Prometheus recorder");
}
