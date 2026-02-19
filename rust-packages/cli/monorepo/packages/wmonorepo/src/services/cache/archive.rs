use crate::error::AppResult;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use flate2::write::GzEncoder;
use flate2::Compression;
use std::fs::File;
use tar::Builder;

use super::cache::{cache_dir_path, get_cache_path};

pub fn archive_outputs(
    workspace: &Workspace,
    task_config: &TaskConfig,
    hash: &str,
) -> AppResult<()> {
    std::fs::create_dir_all(cache_dir_path())?;
    let cache_path = get_cache_path(hash);
    let file = File::create(cache_path)?;
    let enc = GzEncoder::new(file, Compression::default());
    let mut tar = Builder::new(enc);

    for pattern in &task_config.outputs {
        for entry in glob::glob(&workspace.path.join(pattern).to_string_lossy())? {
            let path = entry?;
            if path.is_dir() {
                tar.append_dir_all(path.strip_prefix(&workspace.path)?, &path)?;
            } else {
                tar.append_path_with_name(&path, path.strip_prefix(&workspace.path)?)?;
            }
        }
    }

    Ok(())
}

pub fn restore_outputs(workspace: &Workspace, hash: &str) -> AppResult<()> {
    let cache_path = get_cache_path(hash);
    let file = File::open(cache_path)?;
    let mut archive = tar::Archive::new(flate2::read::GzDecoder::new(file));
    archive.unpack(&workspace.path)?;
    Ok(())
}

pub fn clean_outputs(workspace: &Workspace, task_config: &TaskConfig) -> AppResult<()> {
    for pattern in &task_config.outputs {
        let glob_pattern = workspace.path.join(pattern).to_string_lossy().to_string();
        for entry in glob::glob(&glob_pattern)? {
            let path = entry?;
            if path.is_dir() {
                std::fs::remove_dir_all(&path)?;
            } else if path.is_file() {
                std::fs::remove_file(&path)?;
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_clean_outputs() {
        let temp_dir = std::env::temp_dir();
        let test_dir = temp_dir.join("test_clean_outputs");
        std::fs::create_dir_all(&test_dir).unwrap();

        let file1 = test_dir.join("file1.txt");
        let file2 = test_dir.join("file2.txt");
        std::fs::write(&file1, b"content1").unwrap();
        std::fs::write(&file2, b"content2").unwrap();

        let workspace = Workspace {
            path: test_dir.clone(),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };

        let task_config = TaskConfig {
            outputs: vec!["*.txt".to_string()],
            ..Default::default()
        };

        clean_outputs(&workspace, &task_config).unwrap();

        assert!(!file1.exists());
        assert!(!file2.exists());

        std::fs::remove_dir_all(&test_dir).unwrap();
    }
}
