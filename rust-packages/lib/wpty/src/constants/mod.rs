//! Constants used throughout the wpty crate

/// Default shell to use when spawning PTY
pub const DEFAULT_SHELL: &str = "powershell";

/// Default working directory
pub const DEFAULT_WORKING_DIR: &str = "~";

/// Default tab title
pub const DEFAULT_TAB_TITLE: &str = "New Tab";

/// Session file name for persistence
pub const SESSION_FILE: &str = "session.json";

/// Config file name
pub const CONFIG_FILE: &str = "Config.toml";

/// Environment variable prefix
pub const ENV_PREFIX: &str = "WPTY_";
