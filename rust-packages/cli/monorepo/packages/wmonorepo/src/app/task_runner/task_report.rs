// Task report functions

use crate::error::AppResult;
use crate::types::report::{write_report_json, RunReport, WorkspaceRunReport};

pub struct TaskReportOptions {
    pub report_json: Option<String>,
}

pub fn write_task_report(
    task: &str,
    scope: Option<&String>,
    reports: Vec<WorkspaceRunReport>,
    options: &TaskReportOptions,
) -> AppResult<()> {
    if let Some(path) = &options.report_json {
        let report = RunReport {
            task: task.to_string(),
            scope: scope.cloned(),
            workspaces: reports,
        };
        write_report_json(path, &report)?;
    }
    Ok(())
}
