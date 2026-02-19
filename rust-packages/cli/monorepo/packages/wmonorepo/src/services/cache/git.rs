use crate::error::{AppError, AppResult};
use std::process::Command;

pub fn changed_files(since: &str) -> AppResult<Vec<String>> {
    let output = Command::new("git")
        .args(["diff", "--name-only", since, "HEAD"])
        .output()?;

    if !output.status.success() {
        return Err(AppError::Unknown(format!(
            "git diff failed with status: {}",
            output.status
        )));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.trim().to_string())
        .collect())
}
