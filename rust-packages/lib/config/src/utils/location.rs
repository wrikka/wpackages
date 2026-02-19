//! File location utilities for configuration
//!
//! This module provides automatic file location detection using the etcetera crate.

use std::path::PathBuf;

/// Configuration file location strategy.
#[derive(Debug, Clone, Copy)]
pub enum ConfigLocationStrategy {
    /// App strategy: Use application-specific config directory
    App,
    /// Native strategy: Use OS-native config directory
    Native,
}

impl Default for ConfigLocationStrategy {
    fn default() -> Self {
        Self::App
    }
}

/// Gets the default configuration file path.
///
/// # Arguments
///
/// * `strategy` - The location strategy to use
///
/// # Returns
///
/// Returns the default configuration file path.
///
/// # Example
///
/// ```no_run
/// use config::utils::location::default_config_path;
/// use config::utils::location::ConfigLocationStrategy;
///
/// let path = default_config_path(ConfigLocationStrategy::App);
/// println!("Config path: {:?}", path);
/// ```
pub fn default_config_path(strategy: ConfigLocationStrategy) -> PathBuf {
    let base_dir = match strategy {
        ConfigLocationStrategy::App => get_app_config_dir(),
        ConfigLocationStrategy::Native => get_native_config_dir(),
    };

    base_dir.join("wai").join("Config.toml")
}

/// Gets the application configuration directory.
fn get_app_config_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        let mut path = std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("C:\\ProgramData"));
        path.push("wai");
        path
    }

    #[cfg(target_os = "macos")]
    {
        let mut path = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/Users/default"));
        path.push("Library");
        path.push("Application Support");
        path.push("wai");
        path
    }

    #[cfg(target_os = "linux")]
    {
        let mut path = std::env::var("XDG_CONFIG_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let mut home = std::env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("/home/user"));
                home.push(".config");
                home
            });
        path.push("wai");
        path
    }
}

/// Gets the native configuration directory.
fn get_native_config_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("C:\\ProgramData"))
    }

    #[cfg(target_os = "macos")]
    {
        let mut path = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/Users/default"));
        path.push("Library");
        path.push("Preferences");
        path
    }

    #[cfg(target_os = "linux")]
    {
        let mut path = std::env::var("XDG_CONFIG_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let mut home = std::env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("/home/user"));
                home.push(".config");
                home
            });
        path
    }
}

/// Gets the configuration directory for profiles.
///
/// # Arguments
///
/// * `strategy` - The location strategy to use
///
/// # Returns
///
/// Returns the profiles directory path.
///
/// # Example
///
/// ```no_run
/// use config::utils::location::profiles_dir;
/// use config::utils::location::ConfigLocationStrategy;
///
/// let path = profiles_dir(ConfigLocationStrategy::App);
/// println!("Profiles dir: {:?}", path);
/// ```
pub fn profiles_dir(strategy: ConfigLocationStrategy) -> PathBuf {
    let config_dir = match strategy {
        ConfigLocationStrategy::App => get_app_config_dir(),
        ConfigLocationStrategy::Native => get_native_config_dir(),
    };

    config_dir.join("wai").join("profiles")
}

/// Gets the cache directory.
///
/// # Arguments
///
/// * `strategy` - The location strategy to use
///
/// # Returns
///
/// Returns the cache directory path.
///
/// # Example
///
/// ```no_run
/// use config::utils::location::cache_dir;
/// use config::utils::location::ConfigLocationStrategy;
///
/// let path = cache_dir(ConfigLocationStrategy::App);
/// println!("Cache dir: {:?}", path);
/// ```
pub fn cache_dir(strategy: ConfigLocationStrategy) -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        let mut path = std::env::var("LOCALAPPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("C:\\Windows\\Temp"));
        path.push("wai");
        path.push("cache");
        path
    }

    #[cfg(target_os = "macos")]
    {
        let mut path = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/Users/default"));
        path.push("Library");
        path.push("Caches");
        path.push("wai");
        path
    }

    #[cfg(target_os = "linux")]
    {
        let mut path = std::env::var("XDG_CACHE_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let mut home = std::env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("/home/user"));
                home.push(".cache");
                home
            });
        path.push("wai");
        path
    }
}

/// Gets the data directory.
///
/// # Arguments
///
/// * `strategy` - The location strategy to use
///
/// # Returns
///
/// Returns the data directory path.
///
/// # Example
///
/// ```no_run
/// use config::utils::location::data_dir;
/// use config::utils::location::ConfigLocationStrategy;
///
/// let path = data_dir(ConfigLocationStrategy::App);
/// println!("Data dir: {:?}", path);
/// ```
pub fn data_dir(strategy: ConfigLocationStrategy) -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        let mut path = std::env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("C:\\ProgramData"));
        path.push("wai");
        path.push("data");
        path
    }

    #[cfg(target_os = "macos")]
    {
        let mut path = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/Users/default"));
        path.push("Library");
        path.push("Application Support");
        path.push("wai");
        path
    }

    #[cfg(target_os = "linux")]
    {
        let mut path = std::env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let mut home = std::env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("/home/user"));
                home.push(".local");
                home.push("share");
                home
            });
        path.push("wai");
        path
    }
}

/// Ensures configuration directories exist.
///
/// # Arguments
///
/// * `strategy` - The location strategy to use
///
/// # Returns
///
/// Returns `Ok(())` on success.
///
/// # Example
///
/// ```no_run
/// use config::utils::location::ensure_config_dirs;
/// use config::utils::location::ConfigLocationStrategy;
///
/// ensure_config_dirs(ConfigLocationStrategy::App).unwrap();
/// ```
pub fn ensure_config_dirs(strategy: ConfigLocationStrategy) -> std::io::Result<()> {
    let config_dir = match strategy {
        ConfigLocationStrategy::App => get_app_config_dir(),
        ConfigLocationStrategy::Native => get_native_config_dir(),
    };

    let wai_dir = config_dir.join("wai");
    let profiles_dir = wai_dir.join("profiles");
    let cache_dir = cache_dir(strategy);
    let data_dir = data_dir(strategy);

    std::fs::create_dir_all(&wai_dir)?;
    std::fs::create_dir_all(&profiles_dir)?;
    std::fs::create_dir_all(&cache_dir)?;
    std::fs::create_dir_all(&data_dir)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config_path_app() {
        let path = default_config_path(ConfigLocationStrategy::App);
        assert!(path.ends_with("wai/Config.toml") || path.ends_with("wai\\Config.toml"));
    }

    #[test]
    fn test_default_config_path_native() {
        let path = default_config_path(ConfigLocationStrategy::Native);
        assert!(path.ends_with("wai/Config.toml") || path.ends_with("wai\\Config.toml"));
    }

    #[test]
    fn test_profiles_dir() {
        let path = profiles_dir(ConfigLocationStrategy::App);
        assert!(path.ends_with("wai/profiles") || path.ends_with("wai\\profiles"));
    }

    #[test]
    fn test_cache_dir() {
        let path = cache_dir(ConfigLocationStrategy::App);
        assert!(path.ends_with("wai/cache") || path.ends_with("wai\\cache"));
    }

    #[test]
    fn test_data_dir() {
        let path = data_dir(ConfigLocationStrategy::App);
        assert!(path.ends_with("wai/data") || path.ends_with("wai\\data"));
    }

    #[test]
    fn test_ensure_config_dirs() {
        ensure_config_dirs(ConfigLocationStrategy::App).unwrap();
    }
}
