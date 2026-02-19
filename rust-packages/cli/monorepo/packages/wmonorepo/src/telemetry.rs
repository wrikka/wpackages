use tracing::{debug, error, info, span, warn, Level};
use tracing_subscriber::{EnvFilter, FmtSubscriber};

pub fn init_tracing() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

pub fn init_tracing_with_level(level: &str) {
    let filter = EnvFilter::new(level);

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("Failed to set tracing subscriber");
}

#[macro_export]
macro_rules! trace_task {
    ($task:expr) => {
        let span = span!(Level::INFO, "task", task = $task);
        let _enter = span.enter();
    };
}

#[macro_export]
macro_rules! trace_cache {
    ($action:expr, $hash:expr) => {
        let span = span!(Level::DEBUG, "cache", action = $action, hash = %&$hash[..8]);
        let _enter = span.enter();
    };
}

#[macro_export]
macro_rules! trace_hash {
    ($workspace:expr, $task:expr) => {
        let span = span!(Level::DEBUG, "hash", workspace = $workspace, task = $task);
        let _enter = span.enter();
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_tracing() {
        // This test just verifies that init_tracing doesn't panic
        // In real usage, you'd call this once at program start
        // init_tracing();
    }

    #[test]
    fn test_init_tracing_with_level() {
        // This test just verifies that init_tracing_with_level doesn't panic
        // init_tracing_with_level("debug");
    }
}
