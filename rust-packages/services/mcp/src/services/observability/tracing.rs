use opentelemetry::trace::TracerProvider as _;
use opentelemetry::trace::TracerProvider;
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::runtime;
use opentelemetry_sdk::trace::{Config, SdkTracerProvider, TraceError};
use opentelemetry_sdk::Resource;
use tracing_opentelemetry::OpenTelemetryLayer;
use tracing_subscriber::prelude::*;

#[derive(Debug, Clone)]
pub struct TracingConfig {
    pub service_name: String,
    pub jaeger_endpoint: Option<String>,
    pub otlp_endpoint: Option<String>,
    pub sample_ratio: f64,
}

impl Default for TracingConfig {
    fn default() -> Self {
        Self {
            service_name: "mcp-service".to_string(),
            jaeger_endpoint: None,
            otlp_endpoint: None,
            sample_ratio: 1.0,
        }
    }
}

pub fn init_tracing(config: TracingConfig) -> Result<(), TraceError> {
    let resource = Resource::new(vec![opentelemetry::KeyValue::new(
        "service.name",
        config.service_name.clone(),
    )]);

    let provider = if let Some(jaeger_endpoint) = config.jaeger_endpoint {
        let exporter = opentelemetry_jaeger::new_agent_pipeline()
            .with_endpoint(jaeger_endpoint)
            .with_service_name(config.service_name)
            .install_batch(runtime::Tokio)?;
        SdkTracerProvider::builder()
            .with_batch_exporter(exporter, runtime::Tokio)
            .with_config(Config::default().with_resource(resource))
            .build()
    } else if let Some(otlp_endpoint) = config.otlp_endpoint {
        let exporter = opentelemetry_otlp::new_pipeline()
            .tonic()
            .with_endpoint(otlp_endpoint)
            .install_batch(runtime::Tokio)?;
        SdkTracerProvider::builder()
            .with_batch_exporter(exporter, runtime::Tokio)
            .with_config(Config::default().with_resource(resource))
            .build()
    } else {
        // No exporter configured, return early
        let provider = SdkTracerProvider::builder().build();
        let tracer = provider.tracer("mcp-tracer-no-export");
        let telemetry_layer = OpenTelemetryLayer::new(tracer);
        let subscriber = Registry::default().with(telemetry_layer);
        return tracing::subscriber::set_global_default(subscriber)
            .map_err(|e| TraceError::from(e.to_string()));
    };

    let tracer = provider.tracer("mcp-tracer");

    let telemetry_layer = OpenTelemetryLayer::new(tracer);

    let subscriber = Registry::default().with(telemetry_layer);
    tracing::subscriber::set_global_default(subscriber)
        .map_err(|e| TraceError::from(e.to_string()))?;

    Ok(())
}
