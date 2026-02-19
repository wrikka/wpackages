//! CRON scheduler for periodic tasks

use crate::error::Result;
use crate::types::Task;
use chrono::{DateTime, Timelike, Utc};
use cron::Schedule;
use std::str::FromStr;

pub struct CronScheduler {
    _schedule: Schedule,
}

impl CronScheduler {
    pub fn new(cron_expression: &str) -> Result<Self> {
        let schedule = Schedule::from_str(cron_expression).map_err(|e| {
            crate::error::TaskError::Other(format!("Invalid CRON expression: {}", e))
        })?;

        Ok(Self {
            _schedule: schedule,
        })
    }

    pub fn next_run(&self, after: DateTime<Utc>) -> Option<DateTime<Utc>> {
        self._schedule
            .after(&after)
            .next()
            .map(|dt| dt.with_timezone(&Utc))
    }

    pub fn should_run(&self, now: DateTime<Utc>, last_run: Option<DateTime<Utc>>) -> bool {
        if let Some(last_run) = last_run {
            if let Some(next) = self.next_run(last_run) {
                return now >= next;
            }
            false
        } else {
            true
        }
    }
}

pub fn validate_cron_expression(expression: &str) -> Result<()> {
    Schedule::from_str(expression)
        .map_err(|e| crate::error::TaskError::Other(format!("Invalid CRON expression: {}", e)))?;
    Ok(())
}

pub fn compute_next_schedule(cron_expression: &str, after: DateTime<Utc>) -> Result<DateTime<Utc>> {
    let scheduler = CronScheduler::new(cron_expression)?;
    scheduler
        .next_run(after)
        .ok_or_else(|| crate::error::TaskError::Other("No next run time found".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_cron_expression() {
        assert!(validate_cron_expression("* * * * *").is_ok());
        assert!(validate_cron_expression("0 * * * *").is_ok());
        assert!(validate_cron_expression("*/5 * * * *").is_ok());
    }

    #[test]
    fn test_invalid_cron_expression() {
        assert!(validate_cron_expression("invalid").is_err());
    }

    #[test]
    fn test_next_run() {
        let scheduler = CronScheduler::new("* * * * *").unwrap();
        let now = Utc::now();
        let next = scheduler.next_run(now);
        assert!(next.is_some());
    }
}
