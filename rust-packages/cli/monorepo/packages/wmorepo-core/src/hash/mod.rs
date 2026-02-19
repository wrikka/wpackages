// Hash calculation utilities

use ignore::{overrides::OverrideBuilder, WalkBuilder};
use rayon::prelude::*;
use std::io::{BufReader, Read};
use std::sync::Arc;
use tokio::sync::RwLock;

const HASH_BUFFER_SIZE: usize = 8192;

/// Hash cache with memoization
pub struct HashCache {
    cache: Arc<RwLock<lru::LruCache<String, String>>>,
}

impl HashCache {
    pub fn new(capacity: usize) -> Self {
        HashCache {
            cache: Arc::new(RwLock::new(lru::LruCache::new(capacity))),
        }
    }

    pub async fn get(&self, key: &str) -> Option<String> {
        let cache = self.cache.read().await;
        cache.get(key).cloned()
    }

    pub async fn put(&self, key: String, hash: String) {
        let mut cache = self.cache.write().await;
        cache.put(key, hash);
    }
}

impl Default for HashCache {
    fn default() -> Self {
        Self::new(1000)
    }
}

fn hash_file(
    path: &std::path::Path,
    hasher: &mut blake3::Hasher,
) -> Result<(), Box<dyn std::error::Error>> {
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

/// Calculate hash for a file
pub fn hash_file_to_hash(path: &std::path::Path) -> Result<String, Box<dyn std::error::Error>> {
    let mut hasher = blake3::Hasher::new();
    hash_file(path, &mut hasher)?;
    Ok(hasher.finalize().to_hex().to_string())
}

/// Calculate hash for multiple files in parallel
pub fn hash_files_parallel(
    paths: &[&std::path::Path],
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    paths
        .par_iter()
        .map(|path| hash_file_to_hash(path))
        .collect()
}

/// Combine multiple hashes into one
pub fn combine_hashes(hashes: &[String]) -> String {
    let mut hasher = blake3::Hasher::new();
    for hash in hashes {
        hasher.update(hash.as_bytes());
    }
    hasher.finalize().to_hex().to_string()
}

/// Calculate workspace hash for task execution
pub fn calculate_workspace_hash(
    workspace: &super::workspace::Workspace,
    task_name: &str,
    task_config: &super::workspace::TaskConfig,
) -> Result<String, Box<dyn std::error::Error>> {
    let mut hasher = blake3::Hasher::new();

    hasher.update(task_name.as_bytes());

    for env_key in &task_config.env {
        hasher.update(env_key.as_bytes());
        let value = std::env::var(env_key).unwrap_or_default();
        hasher.update(value.as_bytes());
    }

    // Add lockfiles
    let lockfile_candidates = [
        "bun.lock",
        "bun.lockb",
        "pnpm-lock.yaml",
        "yarn.lock",
        "package-lock.json",
    ];

    for name in lockfile_candidates {
        let path = workspace.path.join(name);
        if path.is_file() {
            hash_file(&path, &mut hasher)?;
        }
    }

    // Add repo config
    let config_path = std::path::Path::new("wmo.config.json");
    if config_path.is_file() {
        hash_file(config_path, &mut hasher)?;
    }

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
