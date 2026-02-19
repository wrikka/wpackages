//! File watcher configuration

use serde::{Deserialize, Serialize};

/// File watcher configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherConfig {
    /// Enable file watching
    pub enabled: bool,
    /// Debounce delay in milliseconds
    pub debounce_ms: u64,
    /// Poll interval for fallback watcher
    pub poll_interval_ms: u64,
    /// Ignore patterns (glob patterns)
    pub ignore_patterns: Vec<String>,
    /// Follow symbolic links
    pub follow_symlinks: bool,
    /// Watch recursively
    pub recursive: bool,
    /// Maximum depth for recursive watching
    pub max_depth: Option<usize>,
}

impl Default for WatcherConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            debounce_ms: 300,
            poll_interval_ms: 1000,
            ignore_patterns: vec![
                "*.tmp".to_string(),
                "*.swp".to_string(),
                ".#*".to_string(),
                "*.log".to_string(),
            ],
            follow_symlinks: false,
            recursive: true,
            max_depth: None,
        }
    }
}

impl WatcherConfig {
    /// Create new watcher config
    pub fn new() -> Self {
        Self::default()
    }

    /// Set enabled status
    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    /// Set debounce delay
    pub fn with_debounce_ms(mut self, debounce_ms: u64) -> Self {
        self.debounce_ms = debounce_ms;
        self
    }

    /// Set poll interval
    pub fn with_poll_interval_ms(mut self, poll_interval_ms: u64) -> Self {
        self.poll_interval_ms = poll_interval_ms;
        self
    }

    /// Add ignore pattern
    pub fn with_ignore_pattern(mut self, pattern: String) -> Self {
        self.ignore_patterns.push(pattern);
        self
    }

    /// Set ignore patterns
    pub fn with_ignore_patterns(mut self, patterns: Vec<String>) -> Self {
        self.ignore_patterns = patterns;
        self
    }

    /// Set follow symlinks
    pub fn with_follow_symlinks(mut self, follow_symlinks: bool) -> Self {
        self.follow_symlinks = follow_symlinks;
        self
    }

    /// Set recursive watching
    pub fn with_recursive(mut self, recursive: bool) -> Self {
        self.recursive = recursive;
        self
    }

    /// Set maximum depth
    pub fn with_max_depth(mut self, max_depth: Option<usize>) -> Self {
        self.max_depth = max_depth;
        self
    }

    /// Check if path should be ignored
    pub fn should_ignore(&self, path: &str) -> bool {
        for pattern in &self.ignore_patterns {
            if let Ok(glob_pattern) = glob::Pattern::new(pattern) {
                if glob_pattern.matches(path) {
                    return true;
                }
            }
        }
        false
    }

    /// Get effective debounce delay
    pub fn effective_debounce_ms(&self) -> u64 {
        if self.enabled {
            self.debounce_ms
        } else {
            0 // No debounce when disabled
        }
    }

    /// Check if recursive watching is enabled
    pub fn is_recursive_enabled(&self) -> bool {
        self.enabled && self.recursive
    }

    /// Get maximum effective depth
    pub fn max_effective_depth(&self) -> Option<usize> {
        if self.is_recursive_enabled() {
            self.max_depth
        } else {
            Some(0) // Only current directory when not recursive
        }
    }
}

/// Watcher mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WatcherMode {
    /// Use notify library (recommended)
    Notify,
    /// Use polling (fallback)
    Poll,
    /// Auto-select best available
    Auto,
}

impl Default for WatcherMode {
    fn default() -> Self {
        Self::Auto
    }
}

/// Watcher capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherCapabilities {
    pub supports_notify: bool,
    pub supports_polling: bool,
    pub supports_recursive: bool,
    pub supports_debounce: bool,
}

impl WatcherCapabilities {
    /// Get current system capabilities
    pub fn current() -> Self {
        Self {
            supports_notify: true, // notify is available on most platforms
            supports_polling: true, // polling is always available
            supports_recursive: true,
            supports_debounce: true,
        }
    }

    /// Check if notify is available
    pub fn is_notify_available() -> bool {
        Self::current().supports_notify
    }

    /// Check if polling is available
    pub fn is_polling_available() -> bool {
        Self::current().supports_polling
    }

    /// Get recommended watcher mode
    pub fn recommended_mode() -> WatcherMode {
        if Self::is_notify_available() {
            WatcherMode::Notify
        } else {
            WatcherMode::Poll
        }
    }
}
