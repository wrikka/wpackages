//! Constants for RVim
//!
//! This directory contains constant values used throughout the application.

/// Default tab width in spaces
pub const DEFAULT_TAB_WIDTH: usize = 4;

/// Maximum file size to open (in bytes)
pub const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10MB

/// Default terminal refresh rate in milliseconds
pub const DEFAULT_REFRESH_RATE: u64 = 16; // ~60 FPS

/// Maximum number of undo steps
pub const MAX_UNDO_STEPS: usize = 1000;

/// Default line number width
pub const DEFAULT_LINE_NUMBER_WIDTH: usize = 4;

/// Minimum window width
pub const MIN_WINDOW_WIDTH: u16 = 80;

/// Minimum window height
pub const MIN_WINDOW_HEIGHT: u16 = 24;

/// Default theme name
pub const DEFAULT_THEME: &str = "dark";

/// Configuration file name
pub const CONFIG_FILE_NAME: &str = "Config.toml";

/// Plugin directory name
pub const PLUGIN_DIR_NAME: &str = "plugins";

/// Cache directory name
pub const CACHE_DIR_NAME: &str = ".cache";
