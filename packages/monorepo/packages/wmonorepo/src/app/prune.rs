use crate::config::WmoRepoConfig;
use crate::error::{AppError, AppResult};
use crate::types::workspace::Workspace;

use ignore::WalkBuilder;
use std::path::{Path, PathBuf};

fn copy_file(src: &Path, dst: &Path) -> AppResult<()> {
    if let Some(parent) = dst.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::copy(src, dst)?;
    Ok(())
}

fn copy_dir_filtered(src_dir: &Path, dst_dir: &Path) -> AppResult<()> {
    let walker = WalkBuilder::new(src_dir)
        .hidden(false)
        .git_ignore(true)
        .git_exclude(true)
        .ignore(true)
        .build();

    for entry in walker {
        let entry = entry?;
        let path = entry.path();

        // Skip directories, they'll be created lazily on file copy.
        if entry.file_type().is_some_and(|ft| ft.is_dir()) {
            continue;
        }
        if !entry.file_type().is_some_and(|ft| ft.is_file()) {
            continue;
        }

        let rel = path.strip_prefix(src_dir)?;
        let out = dst_dir.join(rel);
        copy_file(path, &out)?;
    }

    Ok(())
}

fn repo_root() -> AppResult<PathBuf> {
    Ok(std::env::current_dir()?)
}

pub async fn prune_repo(
    _config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    out_dir: &str,
    scope: Option<&String>,
) -> AppResult<()> {
    let root = repo_root()?;
    let out_dir = PathBuf::from(out_dir);
    std::fs::create_dir_all(&out_dir)?;

    // Copy root config files if present
    for file in [
        "wmo.config.json",
        "package.json",
        "bun.lock",
        "pnpm-lock.yaml",
        "yarn.lock",
        "package-lock.json",
    ] {
        let src = root.join(file);
        if src.is_file() {
            let dst = out_dir.join(file);
            copy_file(&src, &dst)?;
        }
    }

    let selected: Vec<Workspace> = if let Some(scope_name) = scope {
        workspaces
            .into_iter()
            .filter(|ws| ws.package_json.name == *scope_name)
            .collect()
    } else {
        workspaces
    };

    if selected.is_empty() {
        return Err(AppError::Unknown(
            "No workspaces selected for prune".to_string(),
        ));
    }

    for ws in selected {
        let ws_abs = ws.path;
        let rel = ws_abs.strip_prefix(&root).unwrap_or(ws_abs.as_path());
        let dst = out_dir.join(rel);
        copy_dir_filtered(ws_abs.as_path(), dst.as_path())?;
    }

    Ok(())
}
