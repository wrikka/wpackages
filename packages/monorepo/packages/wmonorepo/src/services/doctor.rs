use crate::config::WmoRepoConfig;
use crate::error::{AppError, AppResult};

pub fn run_doctor_checks() -> AppResult<()> {
    println!("Checking configuration file...");
    let config = WmoRepoConfig::load()?;

    if config.workspaces.is_empty() {
        return Err(AppError::Doctor("Configuration validation failed: 'workspaces' array cannot be empty.".to_string()));
    }

    println!("Configuration file looks good.");

    // TODO: Add more checks here, e.g.:
    // - Check for duplicate dependencies
    // - Check for unused dependencies
    // - Check for circular dependencies in package.json (not just task graph)

    Ok(())
}
