use crate::config::{LogFormat, TelemetryConfig};
use crate::error::Result;
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::{fmt, Registry};

pub fn create_layers(
    config: &TelemetryConfig,
) -> Result<Vec<Box<dyn tracing_subscriber::Layer<Registry> + Send + Sync>>> {
    let mut layers = Vec::new();

    match config.log_format {
        LogFormat::Pretty => {
            let layer = fmt::layer()
                .pretty()
                .with_thread_ids(true)
                .with_file(true)
                .with_line_number(true);
            layers.push(Box::new(layer) as Box<dyn tracing_subscriber::Layer<Registry> + Send + Sync>);
        }
        LogFormat::Json => {
            let layer = fmt::layer().json();
            layers.push(Box::new(layer) as Box<dyn tracing_subscriber::Layer<Registry> + Send + Sync>);
        }
    }

    Ok(layers)
}

pub fn init_file_logging(app_name: &str) -> Result<(WorkerGuard, String)> {
    let file_appender = tracing_appender::rolling::daily("./logs", format!("{}.log", app_name));
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    let log_path = std::path::PathBuf::from("./logs");
    let log_path_str = log_path.to_string_lossy().to_string();

    tracing::subscriber::set_global_default(
        tracing_subscriber::registry().with(
            fmt::layer()
                .with_writer(non_blocking)
                .with_ansi(false)
                .with_target(true),
        ),
    )?;

    Ok((guard, log_path_str))
}
