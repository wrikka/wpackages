//! Feature 23: Comprehensive Audit Logging
//! 
//! Logs all actions with timestamps,
//! records reasoning and context,
//! enables forensic analysis.

use anyhow::Result;
use chrono::{DateTime, Utc};
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuditError {
    #[error("Failed to write audit log")]
    WriteFailed,
    #[error("Audit file not accessible")]
    FileNotAccessible,
}

/// Comprehensive audit logger
pub struct AuditLogger {
    log_file: PathBuf,
}

impl AuditLogger {
    pub fn new() -> Result<Self> {
        let log_dir = std::env::current_dir()?.join("logs");
        std::fs::create_dir_all(&log_dir)?;
        
        let log_file = log_dir.join("audit.log");
        
        Ok(Self { log_file })
    }

    /// Log all actions with timestamps
    pub fn log_action(&self, action: &ActionRecord) -> Result<()> {
        let log_entry = format!(
            "[{}] Action: {}, Reasoning: {}, Context: {}\n",
            action.timestamp.to_rfc3339(),
            action.action,
            action.reasoning,
            action.context
        );

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file)?;

        file.write_all(log_entry.as_bytes())?;

        Ok(())
    }

    /// Record reasoning and context
    pub fn record_context(&self, reasoning: &str, context: &str) -> Result<()> {
        let entry = format!(
            "[{}] Reasoning: {}, Context: {}\n",
            Utc::now().to_rfc3339(),
            reasoning,
            context
        );

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file)?;

        file.write_all(entry.as_bytes())?;

        Ok(())
    }

    /// Enable forensic analysis
    pub fn enable_forensics(&self) -> ForensicAnalyzer {
        ForensicAnalyzer {
            log_file: self.log_file.clone(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ActionRecord {
    pub action: String,
    pub reasoning: String,
    pub context: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct ForensicAnalyzer {
    log_file: PathBuf,
}

impl ForensicAnalyzer {
    /// Analyze audit logs for forensic purposes
    pub fn analyze(&self) -> Result<ForensicReport> {
        let file = File::open(&self.log_file)?;
        let reader = BufReader::new(file);

        let mut total_actions = 0;
        let mut errors = 0;
        let mut timestamps = vec![];

        for line in reader.lines() {
            let line = line?;
            total_actions += 1;

            if line.to_lowercase().contains("error") || line.to_lowercase().contains("fail") {
                errors += 1;
            }

            if let Some(ts_str) = line.split(']').next() {
                if let Ok(ts) = DateTime::parse_from_rfc3339(&ts_str[1..]) {
                    timestamps.push(ts.with_timezone(&Utc));
                }
            }
        }

        let time_range = if timestamps.is_empty() {
            (Utc::now(), Utc::now())
        } else {
            (*timestamps.first().unwrap(), *timestamps.last().unwrap())
        };

        Ok(ForensicReport {
            total_actions,
            errors,
            time_range,
        })
    }
}

#[derive(Debug, Clone)]
pub struct ForensicReport {
    pub total_actions: u32,
    pub errors: u32,
    pub time_range: (DateTime<Utc>, DateTime<Utc>),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audit_logger() {
        let logger = AuditLogger::new().expect("Failed to create AuditLogger");
        let record = ActionRecord {
            action: "click".to_string(),
            reasoning: "User requested".to_string(),
            context: "button found".to_string(),
            timestamp: Utc::now(),
        };
        logger.log_action(&record).expect("Failed to log action");
    }
}
