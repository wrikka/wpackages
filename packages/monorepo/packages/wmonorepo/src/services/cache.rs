use crate::error::AppResult;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use flate2::write::GzEncoder;
use flate2::Compression;
use ignore::{overrides::OverrideBuilder, WalkBuilder};
use std::fs::File;
use std::io::Read;
use tar::Builder;

const CACHE_DIR: &str = ".wmo/cache";

pub fn calculate_workspace_hash(workspace: &Workspace, outputs: &[String]) -> AppResult<String> {
    let mut hasher = blake3::Hasher::new();
        let mut walker_builder = WalkBuilder::new(&workspace.path);

    let mut override_builder = OverrideBuilder::new(&workspace.path);
    if !outputs.is_empty() {
        for pattern in outputs {
            let negated_pattern = format!("!{}", pattern);
            override_builder.add(&negated_pattern)?;
        }
    }
    let overrides = override_builder.build()?;
    walker_builder.overrides(overrides);

    let walker = walker_builder.build();

    for result in walker {
        let entry = result?;
        if entry.file_type().map_or(false, |ft| ft.is_file()) {
            let path = entry.path();
            hasher.update(path.to_str().unwrap_or("").as_bytes());

            let mut file = std::fs::File::open(path)?;
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)?;
            hasher.update(&buffer);
        }
    }


    Ok(hasher.finalize().to_hex().to_string())
}

pub fn get_cache_path(hash: &str) -> String {
    format!("{}/{}.tar.gz", CACHE_DIR, hash)
}

pub fn is_cached(hash: &str) -> bool {
    let cache_path = get_cache_path(hash);
    std::path::Path::new(&cache_path).exists()
}

pub fn archive_outputs(workspace: &Workspace, task_config: &TaskConfig, hash: &str) -> AppResult<()> {
    std::fs::create_dir_all(CACHE_DIR)?;
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
