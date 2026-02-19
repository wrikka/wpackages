use std::path::Path;

use super::error::ContextResult;

pub fn get_recent_files(path: &Path) -> ContextResult<Vec<String>> {
    let mut files = Vec::new();

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    if let Ok(modified) = metadata.modified() {
                        let age = chrono::Utc::now().signed_duration_since(
                            chrono::DateTime::from_timestamp(
                                modified.duration_since(std::time::UNIX_EPOCH)?.as_secs() as i64,
                                0,
                            )
                            .unwrap_or(chrono::Utc::now()),
                        );

                        if age.num_days() < 7 {
                            if let Some(name) = entry.file_name().to_str() {
                                files.push(name.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    files.sort();
    files.truncate(20);

    Ok(files)
}

pub fn get_git_info(path: &Path) -> ContextResult<(Option<String>, Option<String>)> {
    let git_path = path.join(".git");

    if !git_path.exists() {
        return Ok((None, None));
    }

    let head_path = git_path.join("HEAD");
    if let Ok(content) = std::fs::read_to_string(&head_path) {
        if let Some(branch) = content.strip_prefix("ref: refs/heads/") {
            let branch = branch.trim().to_string();

            let config_path = git_path.join("config");
            if let Ok(config_content) = std::fs::read_to_string(&config_path) {
                if let Some(line) = config_content.lines().find(|l| l.contains("url =")) {
                    if let Some(start) = line.find("url = ") {
                        let url = line[start + 6..].trim().to_string();
                        return Ok((Some(branch), Some(url)));
                    }
                }
            }

            return Ok((Some(branch), None));
        }
    }

    Ok((None, None))
}
