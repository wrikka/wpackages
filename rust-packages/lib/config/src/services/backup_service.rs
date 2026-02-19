//! Backup service for configuration management
//!
//! Service for creating and managing configuration backups.

use std::path::{Path, PathBuf};
use std::fs;

use super::super::error::{ConfigError, ConfigResult};
use super::super::types::{AppConfig, ConfigFormat};
use super::file_service::FileService;

/// Backup service for configuration operations.
pub struct BackupService {
    backup_dir: PathBuf,
}

impl BackupService {
    /// Creates a new backup service.
    ///
    /// # Arguments
    ///
    /// * `backup_dir` - The directory to store backups
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::backup_service::BackupService;
    /// use std::path::Path;
    ///
    /// let service = BackupService::new(Path::new("config_backups"));
    /// ```
    pub fn new<P: AsRef<Path>>(backup_dir: P) -> Self {
        Self {
            backup_dir: backup_dir.as_ref().to_path_buf(),
        }
    }

    /// Creates a backup of a configuration file.
    ///
    /// # Arguments
    ///
    /// * `config_path` - The path to the configuration file to backup
    ///
    /// # Returns
    ///
    /// Returns the path to the created backup.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::backup_service::BackupService;
    /// use std::path::Path;
    ///
    /// let service = BackupService::new(Path::new("config_backups"));
    /// let backup_path = service.create_backup(Path::new("Config.toml")).unwrap();
    /// println!("Backup created at: {:?}", backup_path);
    /// ```
    pub fn create_backup<P: AsRef<Path>>(&self, config_path: P) -> ConfigResult<PathBuf> {
        let config_path = config_path.as_ref();

        if !config_path.exists() {
            return Err(ConfigError::NotFound(config_path.display().to_string()));
        }

        fs::create_dir_all(&self.backup_dir)?;

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let filename = config_path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("config");
        let backup_filename = format!("{}_{}.bak", filename, timestamp);
        let backup_path = self.backup_dir.join(&backup_filename);

        fs::copy(config_path, &backup_path)?;

        Ok(backup_path)
    }

    /// Lists all available backups.
    ///
    /// # Returns
    ///
    /// Returns a vector of backup file paths sorted by modification time (newest first).
    pub fn list_backups(&self) -> ConfigResult<Vec<PathBuf>> {
        let mut backups = Vec::new();

        if !self.backup_dir.exists() {
            return Ok(backups);
        }

        for entry in fs::read_dir(&self.backup_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("bak") {
                backups.push(path);
            }
        }

        backups.sort_by(|a, b| {
            let a_meta = fs::metadata(a);
            let b_meta = fs::metadata(b);

            match (a_meta, b_meta) {
                (Ok(a_m), Ok(b_m)) => {
                    let a_time = a_m.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
                    let b_time = b_m.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
                    b_time.cmp(&a_time)
                }
                _ => std::cmp::Ordering::Equal,
            }
        });

        Ok(backups)
    }

    /// Restores a configuration from a backup.
    ///
    /// # Arguments
    ///
    /// * `backup_path` - The path to the backup file
    /// * `target_path` - The path to restore to
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::backup_service::BackupService;
    /// use std::path::Path;
    ///
    /// let service = BackupService::new(Path::new("config_backups"));
    /// service.restore_backup(
    ///     Path::new("config_backups/config_20240101_120000.bak"),
    ///     Path::new("Config.toml")
    /// ).unwrap();
    /// ```
    pub fn restore_backup<P: AsRef<Path>, Q: AsRef<Path>>(
        &self,
        backup_path: P,
        target_path: Q,
    ) -> ConfigResult<()> {
        let backup_path = backup_path.as_ref();
        let target_path = target_path.as_ref();

        if !backup_path.exists() {
            return Err(ConfigError::NotFound(backup_path.display().to_string()));
        }

        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::copy(backup_path, target_path)?;
        Ok(())
    }

    /// Deletes a backup.
    ///
    /// # Arguments
    ///
    /// * `backup_path` - The path to the backup file to delete
    pub fn delete_backup<P: AsRef<Path>>(&self, backup_path: P) -> ConfigResult<()> {
        let backup_path = backup_path.as_ref();

        if !backup_path.exists() {
            return Err(ConfigError::NotFound(backup_path.display().to_string()));
        }

        fs::remove_file(backup_path)?;
        Ok(())
    }

    /// Cleans up old backups, keeping only the most recent N backups.
    ///
    /// # Arguments
    ///
    /// * `keep_count` - The number of backups to keep
    ///
    /// # Returns
    ///
    /// Returns the number of deleted backups.
    pub fn cleanup_old_backups(&self, keep_count: usize) -> ConfigResult<usize> {
        let mut backups = self.list_backups()?;

        if backups.len() <= keep_count {
            return Ok(0);
        }

        let to_delete = backups.split_off(keep_count);
        let mut deleted = 0;

        for backup in to_delete {
            if self.delete_backup(&backup).is_ok() {
                deleted += 1;
            }
        }

        Ok(deleted)
    }
}
