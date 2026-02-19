//! # Diff Analysis
//!
//! Logic for analyzing diff content.

use crate::app::state::IdeState;
use once_cell::sync::Lazy;

static HUNK_HEADER_REGEX: Lazy<regex::Regex> =
    Lazy::new(|| regex::Regex::new(r"@@ -(\d+),?\d* \+(\d+),?\d* @@").expect("Invalid hunk header regex pattern"));

pub fn analyze_diff(state: &mut IdeState, diff_content: &str, file_path: &str) {
    let mut changes = Vec::new();
    let mut current_change: Option<crate::types::diff_navigation::DiffChange> = None;
    let mut context_lines = Vec::new();
    let mut line_num = 1;

    for line in diff_content.lines() {
        if line.starts_with("@@") {
            // Save previous change if exists
            if let Some(mut change) = current_change.take() {
                change.context_lines = context_lines.clone();
                changes.push(change);
            }
            context_lines.clear();

            // Parse hunk header
            // Example: @@ -1,4 +1,4 @@
            if let Some(caps) = HUNK_HEADER_REGEX.captures(line) {
                let start_line = caps
                    .get(2)
                    .and_then(|m| m.as_str().parse::<usize>().ok())
                    .unwrap_or(1);
                line_num = start_line;
            }
        } else if line.starts_with('+') && !line.starts_with("+++") {
            if current_change.is_none() {
                current_change = Some(crate::types::diff_navigation::DiffChange {
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    change_type: crate::types::diff_navigation::ChangeType::Addition,
                    context_lines: Vec::new(),
                });
            }
            context_lines.push(line.to_string());
            line_num += 1;
        } else if line.starts_with('-') && !line.starts_with("---") {
            if current_change.is_none() {
                current_change = Some(crate::types::diff_navigation::DiffChange {
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    change_type: crate::types::diff_navigation::ChangeType::Deletion,
                    context_lines: Vec::new(),
                });
            }
            context_lines.push(line.to_string());
        } else {
            context_lines.push(line.to_string());
            line_num += 1;
        }
    }

    // Save last change
    if let Some(mut change) = current_change {
        change.context_lines = context_lines;
        change.line_end = line_num;
        changes.push(change);
    }

    state.diff_navigation.changes = changes;
    state.diff_navigation.total_changes = changes.len();
    state.diff_navigation.current_change_index = if changes.is_empty() {
        None
    } else {
        Some(0)
    };
}
