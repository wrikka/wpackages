use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum CacheSource {
    None,
    Local,
    Remote,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkspaceRunReport {
    pub name: String,
    pub task: String,
    pub hash: String,
    pub cache: CacheSource,
    pub cached: bool,
    pub duration_ms: u128,
}

#[derive(Debug, Clone, Serialize)]
pub struct RunReport {
    pub task: String,
    pub scope: Option<String>,
    pub workspaces: Vec<WorkspaceRunReport>,
}

pub fn write_report_json(path: &str, report: &RunReport) -> crate::error::AppResult<()> {
    let json = serde_json::to_string_pretty(report)?;
    if path == "-" {
        println!("{}", json);
        return Ok(());
    }

    if let Some(parent) = std::path::Path::new(path).parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent)?;
        }
    }
    std::fs::write(path, json)?;
    Ok(())
}
