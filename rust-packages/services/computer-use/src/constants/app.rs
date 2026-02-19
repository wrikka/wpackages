//! Application constants

/// Application name
pub const APP_NAME: &str = "computer-use";

/// Application version
pub const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

/// Default session name
pub const DEFAULT_SESSION: &str = "default";

/// IPC protocol version
pub const PROTOCOL_VERSION: &str = "1.0.0";

/// Default daemon host
pub const DEFAULT_HOST: &str = "127.0.0.1";

/// Minimum daemon port
pub const MIN_PORT: u16 = 40000;

/// Maximum daemon port
pub const MAX_PORT: u16 = 60000;
