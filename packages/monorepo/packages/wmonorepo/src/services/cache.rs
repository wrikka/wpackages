use crate::error::AppResult;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use flate2::write::GzEncoder;
use flate2::Compression;
use ignore::{overrides::OverrideBuilder, WalkBuilder};
use std::fs::File;
use std::io::Read;
use std::time::SystemTime;
use tar::Builder;

const CACHE_DIR: &str = ".wmo/cache";

fn cache_dir_path() -> std::path::PathBuf {
    if let Ok(value) = std::env::var("WMO_CACHE_DIR") {
        if !value.trim().is_empty() {
            return std::path::PathBuf::from(value);
        }
    }
    std::path::PathBuf::from(CACHE_DIR)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CacheStats {
    pub entries: u64,
    pub bytes: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CacheEntry {
    pub file_name: String,
    pub bytes: u64,
    pub modified: Option<SystemTime>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CacheGcResult {
    pub removed_entries: u64,
    pub removed_bytes: u64,
    pub remaining_entries: u64,
    pub remaining_bytes: u64,
}

pub fn cache_dir() -> String {
    cache_dir_path().to_string_lossy().to_string()
}

pub fn inspect_cache() -> AppResult<CacheStats> {
    let path = cache_dir_path();
    if !path.exists() {
        return Ok(CacheStats {
            entries: 0,
            bytes: 0,
        });
    }

    let mut entries = 0u64;
    let mut bytes = 0u64;
    for entry in std::fs::read_dir(&path)? {
        let entry = entry?;
        let meta = entry.metadata()?;
        if meta.is_file() {
            entries += 1;
            bytes += meta.len();
        }
    }

    Ok(CacheStats { entries, bytes })
}

pub fn clean_cache() -> AppResult<()> {
    let path = cache_dir_path();
    if path.exists() {
        std::fs::remove_dir_all(path)?;
    }
    Ok(())
}

pub fn list_cache_entries() -> AppResult<Vec<CacheEntry>> {
    let path = cache_dir_path();
    if !path.exists() {
        return Ok(vec![]);
    }

    let mut out = vec![];
    for entry in std::fs::read_dir(&path)? {
        let entry = entry?;
        let meta = entry.metadata()?;
        if !meta.is_file() {
            continue;
        }

        let file_name = entry.file_name().to_string_lossy().to_string();
        out.push(CacheEntry {
            file_name,
            bytes: meta.len(),
            modified: meta.modified().ok(),
        });
    }

    out.sort_by(|a, b| a.file_name.cmp(&b.file_name));
    Ok(out)
}

pub fn gc_cache(
    max_bytes: Option<u64>,
    max_entries: Option<u64>,
    ttl_seconds: Option<u64>,
    dry_run: bool,
) -> AppResult<CacheGcResult> {
    let path = cache_dir_path();
    if !path.exists() {
        return Ok(CacheGcResult {
            removed_entries: 0,
            removed_bytes: 0,
            remaining_entries: 0,
            remaining_bytes: 0,
        });
    }

    let now = SystemTime::now();
    let mut entries = list_cache_entries()?;

    // Oldest-first (LRU-ish by modified time)
    entries.sort_by(|a, b| match (a.modified, b.modified) {
        (Some(am), Some(bm)) => am.cmp(&bm),
        (Some(_), None) => std::cmp::Ordering::Less,
        (None, Some(_)) => std::cmp::Ordering::Greater,
        (None, None) => a.file_name.cmp(&b.file_name),
    });

    let mut total_entries = entries.len() as u64;
    let mut total_bytes = entries.iter().map(|e| e.bytes).sum::<u64>();

    let ttl_cutoff = ttl_seconds.and_then(|s| now.checked_sub(std::time::Duration::from_secs(s)));

    let mut removed_entries = 0u64;
    let mut removed_bytes = 0u64;

    for entry in entries {
        let is_ttl_expired = ttl_cutoff
            .and_then(|cutoff| entry.modified.map(|m| m < cutoff))
            .unwrap_or(false);

        let over_entries = max_entries.is_some_and(|limit| total_entries > limit);
        let over_bytes = max_bytes.is_some_and(|limit| total_bytes > limit);

        if !(is_ttl_expired || over_entries || over_bytes) {
            continue;
        }

        let file_path = path.join(&entry.file_name);
        if !dry_run {
            let _ = std::fs::remove_file(&file_path);
        }

        removed_entries += 1;
        removed_bytes += entry.bytes;
        total_entries = total_entries.saturating_sub(1);
        total_bytes = total_bytes.saturating_sub(entry.bytes);
    }

    Ok(CacheGcResult {
        removed_entries,
        removed_bytes,
        remaining_entries: total_entries,
        remaining_bytes: total_bytes,
    })
}

fn hash_file(path: &std::path::Path, hasher: &mut blake3::Hasher) -> AppResult<()> {
    hasher.update(path.to_string_lossy().as_bytes());

    let mut file = std::fs::File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    hasher.update(&buffer);
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

    for path in files_to_hash {
        hash_file(&path, &mut hasher)?;
    }

    Ok(hasher.finalize().to_hex().to_string())
}

pub fn get_cache_path(hash: &str) -> String {
    cache_dir_path()
        .join(format!("{}.tar.gz", hash))
        .to_string_lossy()
        .to_string()
}

pub fn is_cached(hash: &str) -> bool {
    let cache_path = get_cache_path(hash);
    std::path::Path::new(&cache_path).exists()
}

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
    use std::sync::{Mutex, OnceLock};

    fn env_lock() -> &'static Mutex<()> {
        static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
        LOCK.get_or_init(|| Mutex::new(()))
    }

    fn unique_temp_cache_dir() -> std::path::PathBuf {
        let mut dir = std::env::temp_dir();
        let pid = std::process::id();
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        dir.push(format!("wmorepo-cache-test-{}-{}", pid, nanos));
        dir
    }

    #[test]
    fn inspect_and_clean_cache() {
        let _guard = env_lock().lock().unwrap();

        let dir = unique_temp_cache_dir();
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("a.tar.gz"), b"123").unwrap();
        std::fs::write(dir.join("b.tar.gz"), b"4567").unwrap();

        std::env::set_var("WMO_CACHE_DIR", &dir);

        let stats = inspect_cache().unwrap();
        assert_eq!(stats.entries, 2);
        assert_eq!(stats.bytes, 3 + 4);

        clean_cache().unwrap();
        let after = inspect_cache().unwrap();
        assert_eq!(after.entries, 0);
        assert_eq!(after.bytes, 0);

        std::env::remove_var("WMO_CACHE_DIR");
    }

    #[test]
    fn list_and_gc_cache() {
        let _guard = env_lock().lock().unwrap();

        let dir = unique_temp_cache_dir();
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("a.tar.gz"), b"1").unwrap();
        std::fs::write(dir.join("b.tar.gz"), b"22").unwrap();
        std::fs::write(dir.join("c.tar.gz"), b"333").unwrap();

        std::env::set_var("WMO_CACHE_DIR", &dir);

        let entries = list_cache_entries().unwrap();
        assert_eq!(entries.len(), 3);

        let result = gc_cache(None, Some(1), None, true).unwrap();
        assert_eq!(result.removed_entries, 2);
        assert_eq!(result.remaining_entries, 1);

        // dry-run does not delete
        let after_dry = list_cache_entries().unwrap();
        assert_eq!(after_dry.len(), 3);

        let result = gc_cache(None, Some(1), None, false).unwrap();
        assert_eq!(result.removed_entries, 2);
        let after = list_cache_entries().unwrap();
        assert_eq!(after.len(), 1);

        std::env::remove_var("WMO_CACHE_DIR");
    }
}
