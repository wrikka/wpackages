//! Compliance Audit Trail (Feature 20)
//!
//! Comprehensive audit logging for HIPAA, SOC2, and enterprise compliance

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Audit event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    ActionExecuted,
    DataAccessed,
    DataModified,
    PermissionCheck,
    UserLogin,
    UserLogout,
    WorkflowStarted,
    WorkflowCompleted,
    WorkflowFailed,
    SettingsChanged,
    ConfigurationChanged,
    ExportPerformed,
    ImportPerformed,
    SensitiveDataHandled,
    EncryptionApplied,
    DecryptionApplied,
}

/// Audit event severity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub event_id: String,
    pub event_type: AuditEventType,
    pub severity: AuditSeverity,
    pub timestamp: u64,
    pub user_id: String,
    pub session_id: String,
    pub workflow_id: Option<String>,
    pub action: Option<String>,
    pub target: String,
    pub outcome: AuditOutcome,
    pub reason: Option<String>,
    pub metadata: HashMap<String, String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditOutcome {
    Success,
    Failure(String),
    Denied(String),
    Warning(String),
}

/// Compliance framework requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceFramework {
    HIPAA,
    SOC2,
    GDPR,
    PCI,
    ISO27001,
    Custom(String),
}

/// Compliance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceConfig {
    pub framework: ComplianceFramework,
    pub retention_days: u32,
    pub encryption_enabled: bool,
    pub tamper_proof: bool,
    pub real_time_alerting: bool,
    pub export_format: ExportFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    Json,
    Csv,
    Syslog,
    SIEM,
}

/// Compliance report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub report_id: String,
    pub framework: ComplianceFramework,
    pub generated_at: u64,
    pub period_start: u64,
    pub period_end: u64,
    pub total_events: u64,
    pub event_breakdown: HashMap<String, u64>,
    pub violations: Vec<Violation>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    pub event_id: String,
    pub severity: AuditSeverity,
    pub description: String,
    pub timestamp: u64,
    pub remediation: String,
}

/// Compliance audit engine
pub struct ComplianceAudit {
    config: ComplianceConfig,
    events: Vec<AuditEvent>,
    tamper_proof_hashes: Vec<String>,
}

impl ComplianceAudit {
    pub fn new(config: ComplianceConfig) -> Self {
        Self {
            config,
            events: Vec::new(),
            tamper_proof_hashes: Vec::new(),
        }
    }

    /// Log an audit event
    pub fn log_event(&mut self, event_type: AuditEventType, target: &str, outcome: AuditOutcome) -> String {
        let event_id = uuid::Uuid::new_v4().to_string();
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let severity = self.determine_severity(&event_type, &outcome);

        let event = AuditEvent {
            event_id: event_id.clone(),
            event_type,
            severity,
            timestamp,
            user_id: self.get_current_user(),
            session_id: self.get_current_session(),
            workflow_id: None,
            action: None,
            target: target.to_string(),
            outcome,
            reason: None,
            metadata: HashMap::new(),
            ip_address: None,
            user_agent: None,
        };

        // Compute tamper-proof hash
        if self.config.tamper_proof {
            let hash = self.compute_hash(&event);
            self.tamper_proof_hashes.push(hash);
        }

        self.events.push(event);

        // Trim old events based on retention
        self.enforce_retention();

        event_id
    }

    /// Log action with full context
    pub fn log_action(&mut self, action: &str, target: &str, success: bool, reason: Option<&str>) -> String {
        let outcome = if success {
            AuditOutcome::Success
        } else {
            AuditOutcome::Failure(reason.unwrap_or("Unknown error").to_string())
        };

        self.log_event(AuditEventType::ActionExecuted, target, outcome)
    }

    /// Log data access
    pub fn log_data_access(&mut self, data_type: &str, data_id: &str, purpose: &str) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("data_type".to_string(), data_type.to_string());
        metadata.insert("data_id".to_string(), data_id.to_string());
        metadata.insert("purpose".to_string(), purpose.to_string());

        let event_id = uuid::Uuid::new_v4().to_string();
        let event = AuditEvent {
            event_id: event_id.clone(),
            event_type: AuditEventType::DataAccessed,
            severity: AuditSeverity::Info,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            user_id: self.get_current_user(),
            session_id: self.get_current_session(),
            workflow_id: None,
            action: None,
            target: data_id.to_string(),
            outcome: AuditOutcome::Success,
            reason: Some(purpose.to_string()),
            metadata,
            ip_address: None,
            user_agent: None,
        };

        self.events.push(event);
        event_id
    }

    /// Log sensitive data handling
    pub fn log_sensitive_data(&mut self, operation: &str, data_type: &str, encrypted: bool) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("operation".to_string(), operation.to_string());
        metadata.insert("data_type".to_string(), data_type.to_string());
        metadata.insert("encrypted".to_string(), encrypted.to_string());

        self.log_event(
            AuditEventType::SensitiveDataHandled,
            data_type,
            AuditOutcome::Success,
        )
    }

    /// Query audit log
    pub fn query(&self, filters: &AuditQuery) -> Vec<&AuditEvent> {
        self.events
            .iter()
            .filter(|e| {
                // Time range filter
                if let Some(start) = filters.start_time {
                    if e.timestamp < start {
                        return false;
                    }
                }
                if let Some(end) = filters.end_time {
                    if e.timestamp > end {
                        return false;
                    }
                }

                // Event type filter
                if let Some(ref event_types) = filters.event_types {
                    if !event_types.contains(&e.event_type) {
                        return false;
                    }
                }

                // Severity filter
                if let Some(ref severities) = filters.severities {
                    if !severities.contains(&e.severity) {
                        return false;
                    }
                }

                // User filter
                if let Some(ref user_id) = filters.user_id {
                    if &e.user_id != user_id {
                        return false;
                    }
                }

                // Target filter
                if let Some(ref target) = filters.target {
                    if !e.target.contains(target) {
                        return false;
                    }
                }

                true
            })
            .collect()
    }

    /// Generate compliance report
    pub fn generate_report(&self, start_time: u64, end_time: u64) -> ComplianceReport {
        let period_events: Vec<&AuditEvent> = self.events
            .iter()
            .filter(|e| e.timestamp >= start_time && e.timestamp <= end_time)
            .collect();

        let mut event_breakdown: HashMap<String, u64> = HashMap::new();
        let mut violations = Vec::new();

        for event in &period_events {
            let key = format!("{:?}", event.event_type);
            *event_breakdown.entry(key).or_insert(0) += 1;

            // Check for violations
            if let Some(violation) = self.check_violation(event) {
                violations.push(violation);
            }
        }

        ComplianceReport {
            report_id: uuid::Uuid::new_v4().to_string(),
            framework: self.config.framework.clone(),
            generated_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            period_start: start_time,
            period_end: end_time,
            total_events: period_events.len() as u64,
            event_breakdown,
            violations,
            summary: self.generate_summary(&period_events),
        }
    }

    /// Export audit log
    pub fn export(&self, format: ExportFormat, path: &str) -> Result<()> {
        let data = match format {
            ExportFormat::Json => {
                serde_json::to_string_pretty(&self.events)?
            }
            ExportFormat::Csv => {
                self.export_csv()?
            }
            ExportFormat::Syslog => {
                self.export_syslog()?
            }
            ExportFormat::SIEM => {
                serde_json::to_string(&self.events)?
            }
        };

        std::fs::write(path, data)?;
        Ok(())
    }

    /// Verify tamper-proof integrity
    pub fn verify_integrity(&self) -> IntegrityReport {
        let mut valid = 0;
        let mut tampered = 0;

        for (i, event) in self.events.iter().enumerate() {
            let current_hash = self.compute_hash(event);
            
            if i < self.tamper_proof_hashes.len() {
                if self.tamper_proof_hashes[i] == current_hash {
                    valid += 1;
                } else {
                    tampered += 1;
                }
            }
        }

        IntegrityReport {
            total_events: self.events.len(),
            valid,
            tampered,
            verified_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }

    /// Get statistics
    pub fn get_stats(&self) -> AuditStats {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        
        let last_24h = now - 86400;
        
        AuditStats {
            total_events: self.events.len() as u64,
            events_24h: self.events.iter().filter(|e| e.timestamp >= last_24h).count() as u64,
            critical_events: self.events.iter().filter(|e| matches!(e.severity, AuditSeverity::Critical)).count() as u64,
            failed_actions: self.events.iter().filter(|e| matches!(e.outcome, AuditOutcome::Failure(_))).count() as u64,
            retention_days: self.config.retention_days,
        }
    }

    fn determine_severity(&self, event_type: &AuditEventType, outcome: &AuditOutcome) -> AuditSeverity {
        match (event_type, outcome) {
            (_, AuditOutcome::Failure(_)) => AuditSeverity::Error,
            (_, AuditOutcome::Denied(_)) => AuditSeverity::Warning,
            (AuditEventType::SensitiveDataHandled, _) => AuditSeverity::Info,
            (AuditEventType::DataAccessed, _) => AuditSeverity::Info,
            (AuditEventType::ActionExecuted, _) => AuditSeverity::Info,
            _ => AuditSeverity::Info,
        }
    }

    fn compute_hash(&self, event: &AuditEvent) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        event.event_id.hash(&mut hasher);
        event.timestamp.hash(&mut hasher);
        event.user_id.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    fn enforce_retention(&mut self) {
        let cutoff = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() - (self.config.retention_days as u64 * 86400);

        self.events.retain(|e| e.timestamp >= cutoff);
    }

    fn check_violation(&self, event: &AuditEvent) -> Option<Violation> {
        match &event.outcome {
            AuditOutcome::Denied(reason) => Some(Violation {
                event_id: event.event_id.clone(),
                severity: event.severity.clone(),
                description: format!("Access denied: {}", reason),
                timestamp: event.timestamp,
                remediation: "Review permissions and access controls".to_string(),
            }),
            AuditOutcome::Failure(reason) if matches!(event.severity, AuditSeverity::Critical) => Some(Violation {
                event_id: event.event_id.clone(),
                severity: event.severity.clone(),
                description: format!("Critical failure: {}", reason),
                timestamp: event.timestamp,
                remediation: "Investigate and fix immediately".to_string(),
            }),
            _ => None,
        }
    }

    fn generate_summary(&self, events: &[&AuditEvent]) -> String {
        let total = events.len();
        let failures = events.iter().filter(|e| matches!(e.outcome, AuditOutcome::Failure(_))).count();
        let success_rate = if total > 0 {
            ((total - failures) as f32 / total as f32) * 100.0
        } else {
            100.0
        };

        format!("{} events logged with {:.1}% success rate", total, success_rate)
    }

    fn export_csv(&self) -> Result<String> {
        let mut csv = "event_id,timestamp,event_type,severity,user_id,target,outcome\n".to_string();
        
        for event in &self.events {
            csv.push_str(&format!(
                "{},{},{:?},{:?},{},{},{:?}\n",
                event.event_id,
                event.timestamp,
                event.event_type,
                event.severity,
                event.user_id,
                event.target,
                event.outcome
            ));
        }
        
        Ok(csv)
    }

    fn export_syslog(&self) -> Result<String> {
        let mut syslog = String::new();
        
        for event in &self.events {
            syslog.push_str(&format!(
                "{} {} computer-use[{}]: {:?} {} {} {:?}\n",
                chrono::NaiveDateTime::from_timestamp_opt(event.timestamp as i64, 0)
                    .map(|dt| dt.to_string())
                    .unwrap_or_default(),
                event.user_id,
                std::process::id(),
                event.event_type,
                event.target,
                event.outcome,
                event.severity
            ));
        }
        
        Ok(syslog)
    }

    fn get_current_user(&self) -> String {
        std::env::var("USER").unwrap_or_else(|_| "unknown".to_string())
    }

    fn get_current_session(&self) -> String {
        uuid::Uuid::new_v4().to_string()
    }
}

/// Query filters for audit log
#[derive(Debug, Clone, Default)]
pub struct AuditQuery {
    pub start_time: Option<u64>,
    pub end_time: Option<u64>,
    pub event_types: Option<Vec<AuditEventType>>,
    pub severities: Option<Vec<AuditSeverity>>,
    pub user_id: Option<String>,
    pub target: Option<String>,
}

/// Integrity verification report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityReport {
    pub total_events: usize,
    pub valid: usize,
    pub tampered: usize,
    pub verified_at: u64,
}

/// Audit statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditStats {
    pub total_events: u64,
    pub events_24h: u64,
    pub critical_events: u64,
    pub failed_actions: u64,
    pub retention_days: u32,
}
