//! Telemetry and Logging
//!
//! ตั้งค่า logging และ tracing สำหรับ application

use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer};

/// Initialize tracing subscriber
///
/// โหลด log level จาก environment variable `RUST_LOG`
/// ถ้าไม่ระบุจะใช้ `info` เป็น default
///
/// # Example
///
/// ```bash
/// RUST_LOG=debug cargo run
/// RUST_LOG=marketplace_api=trace cargo run
/// ```
pub fn init_subscriber() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .with_filter(filter);

    tracing_subscriber::registry().with(subscriber).init();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_subscriber() {
        // This test just verifies the function compiles
        // Actual logging would require a running tokio runtime
        init_subscriber();
    }
}
