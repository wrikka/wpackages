// Cache operations

use std::path::Path;
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

/// Cache entry
#[derive(Debug, Clone)]
pub struct CacheEntry {
    pub key: String,
    pub value: Vec<u8>,
    pub created_at: SystemTime,
    pub expires_at: Option<SystemTime>,
}

/// Cache storage
pub struct CacheStorage {
    cache_dir: std::path::PathBuf,
}

impl CacheStorage {
    pub fn new(cache_dir: &Path) -> Self {
        CacheStorage {
            cache_dir: cache_dir.to_path_buf(),
        }
    }

    pub fn get(&self, key: &str) -> Option<CacheEntry> {
        let path = self.cache_dir.join(key);
        if !path.exists() {
            return None;
        }

        let data = std::fs::read(&path).ok()?;
        // Deserialize CacheEntry from data
        // For now, return None as stub
        None
    }

    pub fn put(&self, key: &str, value: &[u8]) -> Result<(), std::io::Error> {
        let path = self.cache_dir.join(key);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&path, value)
    }

    pub fn delete(&self, key: &str) -> Result<(), std::io::Error> {
        let path = self.cache_dir.join(key);
        if path.exists() {
            std::fs::remove_file(&path)?;
        }
        Ok(())
    }

    pub fn clear(&self) -> Result<(), std::io::Error> {
        if self.cache_dir.exists() {
            std::fs::remove_dir_all(&self.cache_dir)?;
        }
        Ok(())
    }
}

/// Cache statistics
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CacheStats {
    pub entries: u64,
    pub bytes: u64,
}

/// Cache entry info
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CacheEntryInfo {
    pub file_name: String,
    pub bytes: u64,
    pub modified: Option<SystemTime>,
}

/// Cache GC result
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CacheGcResult {
    pub removed_entries: u64,
    pub removed_bytes: u64,
    pub remaining_entries: u64,
    pub remaining_bytes: u64,
}

/// Get cache directory path
pub fn cache_dir() -> String {
    cache_dir_path().to_string_lossy().to_string()
}

/// Inspect cache statistics
pub fn inspect_cache() -> Result<CacheStats, std::io::Error> {
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

/// Clean cache
pub fn clean_cache() -> Result<(), std::io::Error> {
    let path = cache_dir_path();
    if path.exists() {
        std::fs::remove_dir_all(path)?;
    }
    Ok(())
}

/// List cache entries
pub fn list_cache_entries() -> Result<Vec<CacheEntryInfo>, std::io::Error> {
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
        out.push(CacheEntryInfo {
            file_name,
            bytes: meta.len(),
            modified: meta.modified().ok(),
        });
    }

    out.sort_by(|a, b| a.file_name.cmp(&b.file_name));
    Ok(out)
}

/// Garbage collect cache
pub fn gc_cache(
    max_bytes: Option<u64>,
    max_entries: Option<u64>,
    ttl_seconds: Option<u64>,
    dry_run: bool,
) -> Result<CacheGcResult, std::io::Error> {
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

/// Get cache path for hash
pub fn get_cache_path(hash: &str) -> String {
    cache_dir_path()
        .join(format!("{}.tar.gz", hash))
        .to_string_lossy()
        .to_string()
}

/// Check if hash is cached
pub fn is_cached(hash: &str) -> bool {
    let cache_path = get_cache_path(hash);
    std::path::Path::new(&cache_path).exists()
}
