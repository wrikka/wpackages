use tracing_subscriber::{EnvFilter, FmtSubscriber};

pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .unwrap_or_else(|e| panic!("Failed to set tracing subscriber: {}", e));
}
