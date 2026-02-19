//! Configuration audit log
//!
//! This module provides audit logging for configuration changes.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// Represents an audit log entry.
#[derive(Debug, Clone)]
pub struct AuditLogEntry {
    timestamp: String,
    user_id: String,
    action: AuditAction,
    changes: Vec<AuditChange>,
}

impl AuditLogEntry {
    /// Creates a new audit log entry.
    ///
    /// # Arguments
    ///
    /// * `timestamp` - The timestamp
    /// * `user_id` - The user who performed the action
    /// * `action` - The action performed
    /// * `changes` - List of changes
    ///
    /// # Returns
    ///
    /// Returns a new entry.
    pub fn new(timestamp: String, user_id: String, action: AuditAction, changes: Vec<AuditChange>) -> Self {
        Self {
            timestamp,
            user_id,
            action,
            changes,
        }
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }

    /// Returns the user ID.
    ///
    /// # Returns
    ///
    /// Returns the user ID.
    pub fn user_id(&self) -> &str {
        &self.user_id
    }

    /// Returns the action.
    ///
    /// # Returns
    ///
    /// Returns the action.
    pub fn action(&self) -> &AuditAction {
        &self.action
    }

    /// Returns the changes.
    ///
    /// # Returns
    ///
    /// Returns the changes.
    pub fn changes(&self) -> &[AuditChange] {
        &self.changes
    }

    /// Returns the number of changes.
    ///
    /// # Returns
    ///
    /// Returns the change count.
    pub fn len(&self) -> usize {
        self.changes.len()
    }

    /// Returns `true` if there are no changes.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.changes.is_empty()
    }
}

/// Represents an audit action.
#[derive(Debug, Clone, PartialEq)]
pub enum AuditAction {
    Create,
    Update,
    Delete,
    Read,
    Export,
    Import,
    Migrate,
    Validate,
}

/// Represents an audit change.
#[derive(Debug, Clone)]
pub struct AuditChange {
    path: String,
    old_value: String,
    new_value: String,
    change_type: ChangeType,
}

/// Represents the type of change.
#[derive(Debug, Clone, PartialEq)]
pub enum ChangeType {
    Added,
    Removed,
    Modified,
}

impl AuditChange {
    /// Creates a new audit change.
    ///
    /// # Arguments
    ///
    /// * `path` - The configuration path
    /// * `old_value` - The old value
    /// * `new_value` - The new value
    /// * `change_type` - The type of change
    ///
    /// # Returns
    ///
    /// Returns a new change.
    pub fn new(
        path: String,
        old_value: String,
        new_value: String,
        change_type: ChangeType,
    ) -> Self {
        Self {
            path,
            old_value,
            new_value,
            change_type,
        }
    }

    /// Returns the path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the old value.
    ///
    /// # Returns
    ///
    /// Returns the old value.
    pub fn old_value(&self) -> &str {
        &self.old_value
    }

    /// Returns the new value.
    ///
    /// # Returns
    ///
    /// Returns the new value.
    pub fn new_value(&self) -> &str {
        &self.new_value
    }

    /// Returns the change type.
    ///
    /// # Returns
    ///
    /// Returns the change type.
    pub fn change_type(&self) -> &ChangeType {
        &self.change_type
    }
}

/// Represents an audit log.
#[derive(Debug, Clone)]
pub struct AuditLog {
    entries: Vec<AuditLogEntry>,
}

impl AuditLog {
    /// Creates a new audit log.
    ///
    /// # Returns
    ///
    /// Returns a new audit log.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec
    ///         AuditChange::new(
    ///             "path".to_string(),
    ///             "old".to_string(),
    ///             "new".to_string(),
    ///             ChangeType::Modified,
    ///         ),
    ///     ),
    /// );
    /// log.add_entry(entry);
    /// ```
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    /// Adds an audit log entry.
    ///
    /// # Arguments
    ///
    /// * `entry` - The entry to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    /// use config::utils::audit_log::AuditLogEntry;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec
    ///         AuditChange::new(
    ///             "path".to_string(),
    ///             "old".to_string(),
    ///             "new".to_string(),
    ///             ChangeType::Modified,
    ///         ),
    ///     ),
    /// );
    /// log.add_entry(entry);
    /// ```
    pub fn add_entry(&mut self, entry: AuditLogEntry) {
        self.entries.push(entry);
    }

    /// Gets an entry by timestamp.
    ///
    /// # Arguments
    ///
    /// * `timestamp` - The timestamp
    ///
    /// # Returns
    ///
    /// Returns the entry if found.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// log.add_entry(entry);
    /// if let Some(entry) = log.get_entry("timestamp") {
    ///     println!("Found entry: {}", entry.action());
    /// }
    /// ```
    pub fn get_entry(&self, timestamp: &str) -> Option<&AuditLogEntry> {
        self.entries
            .iter()
            .find(|e| e.timestamp() == timestamp)
            .map(|e| e)
    }

    /// Gets entries by user ID.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    ///
    /// # Returns
    ///
    /// Returns a list of entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// log.add_entry(entry);
    /// let entries = log.get_entries_by_user("user1");
    /// assert_eq!(entries.len(), 1);
    /// ```
    pub fn get_entries_by_user(&self, user_id: &str) -> Vec<&AuditLogEntry> {
        self.entries
            .iter()
            .filter(|e| e.user_id() == user_id)
            .collect()
    }

    /// Gets entries by action.
    ///
    /// # Arguments
    ///
    /// * `action` - The action to filter by
    ///
    /// # Returns
    ///
    /// Returns a list of entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// log.add_entry(entry);
    /// let entries = log.get_entries_by_action(AuditAction::Update);
    /// assert_eq!(entries.len(), 1);
    /// ```
    pub fn get_entries_by_action(&self, action: AuditAction) -> Vec<&AuditLogEntry> {
        self.entries
            .iter()
            .filter(|e| e.action() == action)
            .collect()
    }

    /// Gets entries by timestamp range.
    ///
    /// # Arguments
    ///
    /// * `start` - Start timestamp
    /// * `end` - End timestamp
    ///
    /// # Returns
    ///
    /// Returns a list of entries in the range.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "1234567890".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// log.add_entry(entry);
    /// let entries = log.get_entries_by_timestamp_range("1234567890", "1234567899");
    /// assert_eq!(entries.len(), 1);
    /// ```
    pub fn get_entries_by_timestamp_range(
        &self,
        start: &str,
        end: &str,
    ) -> Vec<&AuditLogEntry> {
        self.entries
            .iter()
            .filter(|e| {
                let ts = e.timestamp().parse::<u64>().unwrap_or(0);
                let start_ts = start.parse::<u64>().unwrap_or(0);
                let end_ts = end.parse::<u64>().unwrap_or(0);
                ts >= start_ts && ts <= end_ts
            })
            .collect()
    }

    /// Returns the number of entries.
    ///
    /// # Returns
    ///
    /// Returns the entry count.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Returns `true` if there are no entries.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Clears all entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let mut log = AuditLog::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// log.add_entry(entry);
    /// log.clear();
    /// assert!(log.is_empty());
    /// ```
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Returns the number of entries by action.
    ///
    /// # Arguments
    ///
    /// * `action` - The action to count
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn count_by_action(&self, action: AuditAction) -> usize {
        self.entries
            .iter()
            .filter(|e| e.action() == action)
            .count()
    }

    /// Returns the number of entries by user.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn count_by_user(&self, user_id: &str) -> usize {
        self.entries
            .iter()
            .filter(|e| e.user_id() == user_id)
            .count()
    }

    /// Generates an audit report.
    ///
    /// # Returns
    ///
    /// Returns the report as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditLog;
    ///
    /// let log = AuditLog::new();
    /// let report = log.generate_report();
    /// println!("{}", report);
    /// ```
    pub fn generate_report(&self) -> String {
        let mut report = String::new();

        report.push_str("# Audit Log Report\n\n");

        let total_entries = self.len();
        let total_users: std::collections::HashSet<String> = self
            .entries
            .iter()
            .map(|e| e.user_id().to_string())
            .collect();

        report.push_str(&format!("Total Entries: {}\n", total_entries));
        report.push_str(&format!("Total Users: {}\n", total_users.len()));

        if total_entries > 0 {
            // Count by action
            let create_count = self.count_by_action(AuditAction::Create);
            let update_count = self.count_by_action(AuditAction::Update);
            let delete_count = self.count_by_action(AuditAction::Delete);
            let read_count = self.count_by_action(AuditAction::Read);

            report.push_str("\n## Actions\n");
            report.push_str(&format!("- Create: {}\n", create_count));
            report.push_str(&format!("- Update: {}\n", update_count));
            report.push_str(&format!("- Delete: {}\n", delete_count));
            report.push_str(&format!("- Read: {}\n", read_count));

            // Count by user
            let mut user_counts: Vec<(String, usize)> = Vec::new();
            for user_id in total_users {
                let count = self.count_by_user(user_id);
                user_counts.push((user_id, count));
            }
            user_counts.sort_by(|a, b| b.cmp(&a, b));

            report.push_str("\n## Top Users\n");
            for (user_id, count) in user_counts.iter().take(10) {
                report.push_str(&format!("- {}: {} entries\n", user_id, count));
            }
        }

        report
    }

    /// Returns the number of changes.
    ///
    /// # Returns
    ///
    /// Returns the change count.
    pub fn total_changes(&self) -> usize {
        self.entries
            .iter()
            .fold(0, |acc, entry| acc + entry.len())
    }
}

impl Default for AuditLog {
    fn default() -> Self {
        Self::new()
    }
}

/// Creates an audit log entry for configuration changes.
///
/// # Arguments
///
/// * `old_config` - The old configuration
/// * `new_config` /// The new configuration
/// * `user_id` - The user who made the changes
///
/// # Returns
///
/// Returns a new audit log entry.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::create_audit_entry;
/// use config::types::AppConfig;
///
/// let old = AppConfig::default();
/// let mut new = AppConfig::default();
/// new.appearance.theme_id = "light".to_string();
/// let entry = create_audit_entry(&old, &new, "user1").unwrap();
/// ```
pub fn create_audit_entry(
    old_config: &AppConfig,
    new_config: &AppConfig,
    user_id: &str,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let mut changes = Vec::new();

    // Detect changes
    if old_config.appearance.theme_id != new_config.appearance.theme_id {
        changes.push(AuditChange::new(
            "appearance.theme_id".to_string(),
            old_config.appearance.theme_id.clone(),
            new_config.appearance.theme_id.clone(),
            ChangeType::Modified,
        ));
    }

    if old_config.appearance.font.size != new_config.appearance.font.size {
        changes.push(AuditChange::new(
            "appearance.font.size".to_string(),
            old_config.appearance.font.size.to_string(),
            new_config.appearance.font.size.to_string(),
            ChangeType::Modified,
        ));
    }

    if old_config.behavior.auto_save != new_config.behavior.auto_save {
        changes.push(AuditChange::new(
            "behavior.auto_save".to_string(),
            old_config.behavior.auto_save.to_string(),
            new_config.behavior.auto_save.to_string(),
            ChangeType::Modified,
        ));
    }

    if old_config.advanced.log_level != new_config.advanced.log_level {
        changes.push(AuditChange::new(
            "advanced.log_level".to_string(),
            old_config.advanced.log_level.clone(),
            new_config.advanced.log_level.clone(),
            ChangeType::Modified,
        ));
    }

    if old_config.pty.shell != new_config.pty.shell {
        changes.push(AuditChange::new(
            "pty.shell".to_string(),
            old_config.pty.shell.clone(),
            new_config.pty.shell.clone(),
            ChangeType::Modified,
        ));
    }

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Update,
        changes,
    ))
}

/// Creates an audit log entry for configuration creation.
///
/// # Arguments
///
/// * `config` - The configuration that was created
/// * `user_id` - The user who created it
///
/// # Returns
///
/// Returns a new audit log entry.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::create_creation_entry;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let entry = create_creation_entry(&config, "user1").unwrap();
/// ```
pub fn create_creation_entry(
    config: &AppConfig,
    user_id: &str,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let changes = vec
![
        AuditChange::new(
            "appearance.theme_id".to_string(),
            "".to_string(),
            config.appearance.theme_id.clone(),
            ChangeType::Added,
        ),
        AuditChange::new(
            "appearance.font.size".to_string(),
            "".to_string(),
            config.appearance.font.size.to_string(),
            ChangeType::Added,
        ),
    ];

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Create,
        changes,
    ))
}

/// Creates an audit log entry for configuration deletion.
///
/// # Arguments
///
/// * `config` - The configuration that was deleted
/// * `user_id` - The user who deleted it
///
/// # Returns
///
/// Returns a new audit log entry.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::create_deletion_entry;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let entry = create_deletion_entry(&config, "user1").unwrap();
/// ```
pub fn create_deletion_entry(
    config: &AppConfig,
    user_id: &str,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let changes = vec
![
        AuditChange::new(
            "appearance.theme_id".to_string(),
            config.appearance.theme_id.clone(),
            "".to_string(),
            ChangeType::Removed,
        ),
        AuditChange::new(
            "appearance.font.size".to_string(),
            config.appearance.font.size.to_string(),
            "".to_string(),
            ChangeType::Removed,
        ),
    ];

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Delete,
        changes,
    ))
}

/// Creates an audit log entry for configuration export.
///
/// # Arguments
///
/// * `config` - The configuration that was exported
/// * `user_id` - The user who exported it
/// * `format` - The export format
///
/// # Returns
///
/// /// Returns a new audit log entry.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::create_export_entry;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// let entry = create_export_entry(&config, "user1", ConfigFormat::Toml).unwrap();
/// ```
pub fn create_export_entry(
    config: &AppConfig,
    user_id: &str,
    format: ConfigFormat,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::n()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let changes = vec
![AuditChange::new(
            "export".to_string(),
            "".to_string(),
            format!("{:?}", format),
            ChangeType::Added,
        )];

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Export,
        changes,
    ))
}

/// Creates an audit log entry for configuration import.
///
/// # Arguments
///
/// * `config` - The configuration that was imported
/// * `user_id` - The user who imported it
/// * `format` - The import format
///
/// # Returns
///
    /// Returns a new audit log entry.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::create_import_entry;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// let entry = create_import_entry(&config, "user1", ConfigFormat::Toml).unwrap();
/// ```
pub fn create_import_entry(
    config: &AppConfig,
    user_id: &str,
    format: ConfigFormat,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let changes = vec![AuditChange::new(
        "import".to_string(),
        "".to_string(),
        format!("{:?}", format),
        ChangeType::Added,
    )];

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Import,
        changes,
    ))
}

/// Creates an audit log entry for configuration migration.
///
/// # Arguments
///
/// * `old_config` - The old configuration
/// * `new_config` - The new configuration
/// * `user_id` - The user who performed the migration
///
/// # Returns
///
/// /// Returns a new audit log entry.
///
    /// # Example
///
    /// ```no_run
    /// use config::utils::audit_log::create_migration_entry;
    /// use config::types::AppConfig;
    ///
    /// let old = AppConfig::default();
    /// let mut new = AppConfig::default();
    /// new.appearance.theme_id = "light".to_string();
    /// let entry = create_migration_entry(&old, &new, "user1").unwrap();
    /// ```
pub fn create_migration_entry(
    old_config: &AppConfig,
    new_config: &AppConfig,
    user_id: &str,
) -> ConfigResult<AuditLogEntry> {
    use std::time::{SystemTime, UNIX_EVENT};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EVENT)
        .unwrap()
        .as_secs()
        .to_string();

    let mut changes = Vec::new();

    // Detect changes
    if old_config.appearance.theme_id != new_config.appearance.theme_id {
        changes.push(AuditChange::new(
            "appearance.theme_id".to_string(),
            old_config.appearance.theme_id.clone(),
            new_config.appearance.theme_id.clone(),
            ChangeType::Modified,
        ));
    }

    if old_config.appearance.font.size != new_config.appearance.font.size {
        changes.push(AuditChange::new(
            "appearance.font.size".to_string(),
            old_config.appearance.font.size.to_string(),
            new_config.appearance.font.size.to_string(),
            ChangeType::Modified,
        ));
    }

    if old_config.behavior.auto_save != new_config.behavior.auto_save {
        changes.push(AuditChange::new(
            "behavior.auto_save".to_string(),
            old_config.behavior.auto_save.to_string(),
            new_config.behavior.auto_save.to_string(),
            ChangeType::Modified,
        ));
    }

    Ok(AuditLogEntry::new(
        timestamp,
        user_id.to_string(),
        AuditAction::Migrate,
        changes,
    ))
}

/// Gets the audit history for a specific path.
///
/// # Arguments
///
/// * `path` - The configuration path
///
/// # Returns
///
/// /// Returns a list of audit log entries.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::get_audit_history;
///
/// let entries = get_audit_history("appearance.theme_id");
/// for entry in entries {
    ///     println!("{}: {} by {}", entry.timestamp(), entry.action(), entry.user_id());
    /// }
/// ```
pub fn get_audit_history(path: &str) -> Vec<&AuditLogEntry> {
    let mut entries = Vec::new();

    // In a real implementation, this would query the database
    // For now, return empty
    entries
}

/// Generates an audit log report.
///
/// # Arguments
///
/// * `audit_log` - The audit log to report on
///
/// # Returns
///
/// /// Returns the report as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::AuditLog;
///
/// let mut log = AuditLog::new();
/// // Add entries...
/// let report = log.generate_report();
/// println!("{}", report);
/// ```
pub fn generate_audit_report(audit_log: &AuditLog) -> String {
    let mut report = String::new();

    report.push_str("# Audit Log Report\n\n");

    let total_entries = audit_log.len();
    let total_users: std::collections::HashSet<String> = audit_log
        .entries
        .iter()
        .map(|e| e.user_id().to_string())
        .collect();

    report.push_str(&format!("Total Entries: {}\n", total_entries));
    report.push_str(&format!("Total Users: {}\n", total_users.len()));

    if total_entries > 0 {
        // Count by action
        let create_count = audit_log.count_by_action(AuditAction::Create);
        let update_count = audit_log.count_by_action(AuditAction::Update);
        let delete_count = audit_log.count_by_action(AuditAction::Delete);
        let read_count = audit_log.count_by_action(AuditAction::Read);
        let export_count = audit_log.count_by_action(AuditAction::Export);
        let import_count = audit_log.count_by_action(AuditAction::Import);
        let migrate_count = audit_log.count_by_action(AuditAction::Migrate);
        let validate_count = audit_log.count_by_action(AuditAction::Validate);

        report.push_str("\n## Actions\n");
        report.push_str(&format!("- Create: {}\n", create_count));
        report.push_str(&format!("- Update: {}\n", update_count));
        report.push_str(&format!("- Delete: {}\n", delete_count));
        report.push_str(&format!("- Read: {}\n", read_count));
        report.push_str(&format!("- Export: {}\n", export_count));
        report.push_str(&format!("- Import: {}\n", import_count));
        report.push_str(&format!("- Migrate: {}\n", migrate_count));
        report.push_str(&format!("- Validate: {}\n", validate_count));

        // Count by user
        let mut user_counts: Vec<(String, usize)> = Vec::new();
        for user_id in total_users {
            let count = audit_log.count_by_user(user_id);
            user_counts.push((user_id, count));
        }
        user_counts.sort_by(|a, b| b.cmp(&a, b));
        user_counts.sort_by(|a, b| b.cmp(&a, b));

        report.push_str("\n## Top Users\n");
        for (user_id, count) in user_counts.iter().take(10) {
            report.push_str(&format!("- {}: {} entries\n", user_id, count));
        }
    }

    report
}

/// Represents an audit trail.
#[derive(Debug, Clone)]
pub struct AuditTrail {
    entries: Vec<AuditLogEntry>,
}

impl AuditTrail {
    /// Creates a new audit trail.
    ///
    /// # Returns
    ///
    /// Returns a new trail.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let mut trail = AuditTrail::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// trail.add_entry(entry);
    /// ```
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    /// Adds an audit log entry.
    ///
    /// # Arguments
    ///
    /// * `entry` - The entry to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let mut trail = AuditTrail::new();
    /// let entry = AuditLogEntry::new(
    ///     "timestamp".to_string(),
    ///     "user1".to_string(),
    ///     AuditAction::Update,
    ///     vec![],
    /// );
    /// trail.add_entry(entry);
    /// ```
    pub fn add_entry(&mut self, entry: AuditLogEntry) {
        self.entries.push(entry);
    }

    /// Gets all entries in chronological order.
    ///
    /// # Returns
    ///
    /// Returns a list of entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let trail = AuditTrail::new();
    /// trail.add_entry(create_test_entry());
    /// let entries = trail.entries();
    /// println!("Entries: {}", entries.len());
    /// ```
    pub fn entries(&self) -> &[AuditLogEntry] {
        &self.entries
    }

    /// Returns the number of entries.
    ///
    /// # Returns
    ///
    /// Returns the entry count.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let trail = AuditTrail::new();
    /// println!("Entries: {}", trail.len());
    /// ```
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Returns `true` if there are no entries.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let trail = AuditTrail::new();
    /// println!("Empty: {}", trail.is_empty());
    /// ```
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Clears all entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::audit_log::AuditTrail;
    ///
    /// let mut trail = AuditTrail::new();
    /// trail.clear();
    /// assert!(trail.is_empty());
    /// ```
    pub fn clear(&mut self) {
        self.entries.clear();
    }
}

impl Default for AuditTrail {
    fn default() -> Self {
        Self::new()
    }
}

/// Gets the audit trail for a specific path.
///
/// # Arguments
///
/// * `path` - The configuration path
///
/// # Returns
///
/// /// Returns the audit trail for the path.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::get_audit_trail;
///
/// let trail = get_audit_trail("appearance.theme_id");
/// for entry in trail {
    ///     println!("{}: {} by {}", entry.timestamp(), entry.action());
    /// }
/// ```
pub fn get_audit_trail(path: &str) -> AuditTrail {
    // In a real implementation, this would query the database
    // For now, return an empty trail
    AuditTrail::new()
}

/// Gets the audit trail for a specific user.
///
/// # Arguments
///
/// * `user_id` - The user ID
///
/// # Returns
///
    /// Returns the audit trail for the user.
///
/// # Example
///
/// ```no_run
/// use config::utils::audit_log::get_user_trail;
///
/// let trail = get_user_trail("user1");
/// for entry in trail.entries() {
    ///     println!("{}: {}", entry.timestamp(), entry.action());
    /// }
/// ```
pub fn get_user_trail(user_id: &str) -> AuditTrail {
    // In a real implementation, this would query the database
    // For now, return an empty trail
    AuditTrail::new()
}

/// Gets the audit trail for a specific action.
///
/// # Arguments
///
/// * `action` - The action to filter by
///
/// # Returns
///
    /// Returns the audit trail for the action.
///
    /// # Example
///
/// ```no_run
/// use config::utils::audit_log::get_action_trail;
///
/// let trail = get_action_trail(AuditAction::Update);
/// for entry in trail.entries() {
    ///     println!("{}: {} by {}", entry.timestamp(), entry.action(), entry.user_id());
    /// }
/// ```
pub fn get_action_trail(action: AuditAction) -> AuditTrail {
    // In a real implementation, this would query the database
    // For now, return an empty trail
    AuditTrail::new()
}

/// Gets the audit trail for a specific time range.
///
/// # Arguments
///
/// * `start` - Start timestamp
/// * `end` - End timestamp
///
/// # Returns
///
    /// Returns the audit trail for the time range.
///
    /// # Example
///
/// ```no_run
/// use config::utils::audit_log::get_time_range_trail;
///
/// let trail = get_time_range_trail("1234567890", "1234567899");
/// for entry in trail.entries() {
    ///     println!("{}: {}", entry.timestamp(), entry.action());
    /// }
/// ```
pub fn get_time_range_trail(start: &str, end: &str) -> AuditTrail {
    // In a real implementation, this would query the database
    // For now, return an empty trail
    AuditTrail::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_audit_entry() {
        let old = crate::types::AppConfig::default();
        let mut new = crate::types::AppConfig::default();
        new.appearance.theme_id = "light".to_string();

        let entry = create_audit_entry(&old, &new, "user1").unwrap();
        assert_eq!(entry.action(), AuditAction::Update);
        assert_eq!(entry.len(), 1);
    }

    #[test]
    fn test_create_creation_entry() {
        let config = crate::types::AppConfig::default();
        let entry = create_creation_entry(&config, "user1").unwrap();
        assert_eq!(entry.action(), AuditAction::Create);
        assert_eq!(entry.len(), 2);
    }

    #[test]
    fn test_create_deletion_entry() {
        let config = crate::types::AppConfig::default();
        let entry = create_deletion_entry(&config, "user1").unwrap();
        assert_eq!(entry.action(), AuditAction::Delete);
        assert_eq!(entry.len(), 2);
    }

    #[test]
    fn test_create_export_entry() {
        let config = crate::types::AppConfig::default();
        let entry = create_export_entry(&config, "user1", crate::types::ConfigFormat::Toml).unwrap();
        assert_eq!(entry.action(), AuditAction::Export);
        assert_eq!(entry.len(), 1);
    }

    #[test]
    fn test_create_import_entry() {
        let config = crate::types::AppConfig::default();
        let entry = create_import_entry(&config, "user1", crate::types::ConfigFormat::Toml).unwrap();
        assert_eq!(entry.action(), AuditAction::Import);
        assert_eq!(entry.len(), 1);
    }

    #[test]
    fn test_create_migration_entry() {
        let old = crate::types::AppConfig::default();
        let mut new = crate::types::AppConfig::default();
        new.appearance.theme_id = "light".to_string();
        let entry = create_migration_entry(&old, &new, "user1").unwrap();
        assert_eq!(entry.action(), AuditAction::Migrate);
        assert_eq!(entry.len(), 1);
    }

    #[test]
    fn test_audit_trail() {
        let mut trail = AuditTrail::new();
        let entry = AuditLogEntry::new(
            "timestamp".to_string(),
            "user1".to_string(),
            AuditAction::Update,
            vec![],
        );
        trail.add_entry(entry);
        assert_eq!(trail.len(), 1);
    }

    #[test]
    fn test_audit_trail_is_empty() {
        let trail = AuditTrail::new();
        assert!(trail.is_empty());
    }

    #[test]
    fn test_audit_trail_clear() {
        let mut trail = AuditTrail::new();
        let entry = AuditLogEntry::new(
            "timestamp".to_string(),
            "user1".to_string(),
            AuditAction::Update,
            vec![],
        );
        trail.add_entry(entry);
        assert!(!trail.is_empty());
        trail.clear();
        assert!(trail.is_empty());
    }

    #[test]
    fn test_generate_audit_report() {
        let mut log = AuditTrail::new();
        let entry = AuditLogEntry::new(
            "timestamp".to_string(),
            "user1".to_string(),
            AuditAction::Update,
            vec![],
        );
        log.add_entry(entry);
        let report = log.generate_report();
        assert!(report.contains("# Audit Log Report"));
    }

    #[test]
fn test_audit_trail_empty() {
        let trail = get_audit_trail("appearance.theme_id");
        assert!(trail.is_empty());
    }

    #[test]
fn test_audit_trail_user() {
        let trail = get_user_trail("user1");
        assert!(trail.is_empty());
    }

    #[test]
    fn test_audit_trail_action() {
        let trail = get_action_trail(AuditAction::Update);
        assert!(trail.is_empty());
    }

    #[test]
fn test_audit_trail_time_range() {
        let trail = get_time_range_trail("1234567890", "1234567890");
        assert!(trail.is_empty());
    }
}
