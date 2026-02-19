// Task validation functions

use crate::error::{AppError, AppResult};
use crate::types::config::TaskConfig;

pub fn validate_task_config(task_name: &str, task_config: &TaskConfig) -> AppResult<()> {
    for dep in &task_config.depends_on {
        if dep.is_empty() {
            return Err(AppError::Unknown(format!(
                "Task '{}' has invalid depends_on entry: empty string",
                task_name
            )));
        }
    }
    Ok(())
}
