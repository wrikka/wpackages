use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectContext {
    pub path: PathBuf,
    pub name: String,
    pub language: String,
    pub framework: Option<String>,
    pub package_manager: Option<String>,
    pub dependencies: Vec<Dependency>,
    pub recent_files: Vec<String>,
    pub git_branch: Option<String>,
    pub git_remote: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    pub name: String,
    pub version: String,
    pub dev: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageUpdate {
    pub name: String,
    pub current_version: String,
    pub latest_version: String,
    pub security_advisory: Option<SecurityAdvisory>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAdvisory {
    pub severity: String,
    pub description: String,
    pub patched_versions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VulnerabilityReport {
    pub package_name: String,
    pub installed_version: String,
    pub vulnerabilities: Vec<Vulnerability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vulnerability {
    pub id: String,
    pub severity: String,
    pub title: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitInfo {
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub remote: Option<String>,
    pub status: Option<String>,
    pub is_dirty: bool,
}
