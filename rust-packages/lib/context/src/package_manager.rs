use std::path::Path;

use super::error::ContextResult;
use super::types::{PackageUpdate, VulnerabilityReport};

pub async fn check_npm_updates(_path: &Path) -> ContextResult<Vec<PackageUpdate>> {
    Ok(vec![])
}

pub async fn check_cargo_updates(_path: &Path) -> ContextResult<Vec<PackageUpdate>> {
    Ok(vec![])
}

pub async fn check_pip_updates(_path: &Path) -> ContextResult<Vec<PackageUpdate>> {
    Ok(vec![])
}

pub async fn check_npm_vulnerabilities(_path: &Path) -> ContextResult<Vec<VulnerabilityReport>> {
    Ok(vec![])
}

pub async fn check_cargo_vulnerabilities(_path: &Path) -> ContextResult<Vec<VulnerabilityReport>> {
    Ok(vec![])
}

pub async fn check_pip_vulnerabilities(_path: &Path) -> ContextResult<Vec<VulnerabilityReport>> {
    Ok(vec![])
}

pub async fn npm_update(_path: &Path, _packages: Vec<String>) -> ContextResult<()> {
    Ok(())
}

pub async fn yarn_update(_path: &Path, _packages: Vec<String>) -> ContextResult<()> {
    Ok(())
}

pub async fn pnpm_update(_path: &Path, _packages: Vec<String>) -> ContextResult<()> {
    Ok(())
}

pub async fn cargo_update(_path: &Path, _packages: Vec<String>) -> ContextResult<()> {
    Ok(())
}

pub async fn pip_update(_path: &Path, _packages: Vec<String>) -> ContextResult<()> {
    Ok(())
}
