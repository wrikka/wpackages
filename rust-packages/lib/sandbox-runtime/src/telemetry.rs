use tracing_subscriber::{EnvFilter, FmtSubscriber};
use tracing_web::MakeWebConsoleWriter;

pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")); // Log `info` level and above by default

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_writer(MakeWebConsoleWriter::new())
        .with_ansi(false)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}
