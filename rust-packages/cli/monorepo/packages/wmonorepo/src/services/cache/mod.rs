pub mod archive;
pub mod compression;
pub mod concurrency;
pub mod content_store;
pub mod doctor;
pub mod git;
pub mod hash;

use crate::error::AppResult;
use crate::services::cache::archive::{archive_outputs, clean_outputs, restore_outputs};
use crate::services::cache::hash::calculate_workspace_hash;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use std::time::SystemTime;

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
