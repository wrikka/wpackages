use crate::error::AppResult;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use ignore::{overrides::OverrideBuilder, WalkBuilder};
use rayon::prelude::*;
use std::io::{BufReader, Read};
use std::sync::Mutex;

const HASH_BUFFER_SIZE: usize = 8192;

fn hash_file(path: &std::path::Path, hasher: &mut blake3::Hasher) -> AppResult<()> {
    hasher.update(path.to_string_lossy().as_bytes());

    let file = std::fs::File::open(path)?;
    let mut reader = BufReader::with_capacity(HASH_BUFFER_SIZE, file);
    let mut buffer = [0u8; HASH_BUFFER_SIZE];

    loop {
        let n = reader.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }

    Ok(())
}

fn add_lockfiles(workspace: &Workspace, hasher: &mut blake3::Hasher) -> AppResult<()> {
    let candidates = [
        "bun.lock",
        "bun.lockb",
        "pnpm-lock.yaml",
        "yarn.lock",
        "package-lock.json",
    ];

    for name in candidates {
        let path = workspace.path.join(name);
        if path.is_file() {
            hash_file(&path, hasher)?;
        }
    }

    Ok(())
}

fn add_repo_config(hasher: &mut blake3::Hasher) -> AppResult<()> {
    const CONFIG_FILE: &str = "wmo.config.json";
    let path = std::path::Path::new(CONFIG_FILE);
    if path.is_file() {
        hash_file(path, hasher)?;
    }
    Ok(())
}

pub fn calculate_workspace_hash(
    workspace: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
) -> AppResult<String> {
    let mut hasher = blake3::Hasher::new();

    hasher.update(task_name.as_bytes());

    for env_key in &task_config.env {
        hasher.update(env_key.as_bytes());
        let value = std::env::var(env_key).unwrap_or_default();
        hasher.update(value.as_bytes());
    }

    add_repo_config(&mut hasher)?;
    add_lockfiles(workspace, &mut hasher)?;

    let mut files_to_hash: Vec<std::path::PathBuf> = vec![];

    if !task_config.inputs.is_empty() {
        for pattern in &task_config.inputs {
            let joined = workspace.path.join(pattern);
            let glob_pattern = joined.to_string_lossy().to_string();

            for entry in glob::glob(&glob_pattern)? {
                let path = entry?;
                if path.is_file() {
                    files_to_hash.push(path);
                }
            }
        }
    } else {
        let mut walker_builder = WalkBuilder::new(&workspace.path);

        let mut override_builder = OverrideBuilder::new(&workspace.path);
        if !task_config.outputs.is_empty() {
            for pattern in &task_config.outputs {
                let negated_pattern = format!("!{}", pattern);
                override_builder.add(&negated_pattern)?;
            }
        }
        let overrides = override_builder.build()?;
        walker_builder.overrides(overrides);

        let walker = walker_builder.build();
        for result in walker {
            let entry = result?;
            if entry.file_type().is_some_and(|ft| ft.is_file()) {
                files_to_hash.push(entry.path().to_path_buf());
            }
        }
    }

    files_to_hash.sort_by(|a, b| a.to_string_lossy().cmp(&b.to_string_lossy()));

    // Parallel hashing for files
    let file_hashes: Vec<(std::path::PathBuf, String)> = files_to_hash
        .par_iter()
        .filter_map(|path| {
            hash_file_to_hash(path)
                .ok()
                .map(|hash| (path.clone(), hash))
        })
        .collect();

    // Sort by path to ensure deterministic hash
    file_hashes.sort_by(|a, b| a.0.to_string_lossy().cmp(&b.0.to_string_lossy()));

    for (_, file_hash) in file_hashes {
        hasher.update(file_hash.as_bytes());
    }

    Ok(hasher.finalize().to_hex().to_string())
}

fn hash_file_to_hash(path: &std::path::Path) -> AppResult<String> {
    let mut hasher = blake3::Hasher::new();
    hash_file(path, &mut hasher)?;
    Ok(hasher.finalize().to_hex().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_hash_file() {
        let temp_dir = std::env::temp_dir();
        let file_path = temp_dir.join("test_hash_file.txt");
        std::fs::write(&file_path, b"test content").unwrap();

        let mut hasher = blake3::Hasher::new();
        hash_file(&file_path, &mut hasher).unwrap();
        let hash = hasher.finalize().to_hex().to_string();

        assert!(!hash.is_empty());
        assert_eq!(hash.len(), 64);

        std::fs::remove_file(&file_path).unwrap();
    }
}
