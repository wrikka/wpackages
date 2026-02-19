use crate::error::AppResult;
use blake3::Hash;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct ContentEntry {
    pub hash: String,
    pub size: u64,
    pub ref_count: usize,
}

#[derive(Debug, Clone)]
pub struct ContentStore {
    entries: HashMap<String, ContentEntry>,
    content_dir: PathBuf,
}

impl ContentStore {
    pub fn new(cache_dir: &Path) -> Self {
        let content_dir = cache_dir.join("content");
        std::fs::create_dir_all(&content_dir).ok();

        ContentStore {
            entries: HashMap::new(),
            content_dir,
        }
    }

    pub fn store(&mut self, content: &[u8]) -> AppResult<String> {
        let hash = blake3::hash(content).to_hex().to_string();

        if let Some(entry) = self.entries.get_mut(&hash) {
            entry.ref_count += 1;
            return Ok(hash);
        }

        // Store new content
        let content_path = self.content_dir.join(&hash);
        std::fs::write(&content_path, content)?;

        self.entries.insert(
            hash.clone(),
            ContentEntry {
                hash: hash.clone(),
                size: content.len() as u64,
                ref_count: 1,
            },
        );

        Ok(hash)
    }

    pub fn get(&self, hash: &str) -> AppResult<Option<Vec<u8>>> {
        if !self.entries.contains_key(hash) {
            return Ok(None);
        }

        let content_path = self.content_dir.join(hash);
        if content_path.exists() {
            Ok(Some(std::fs::read(&content_path)?))
        } else {
            Ok(None)
        }
    }

    pub fn remove(&mut self, hash: &str) -> AppResult<bool> {
        if let Some(entry) = self.entries.get_mut(hash) {
            entry.ref_count -= 1;

            if entry.ref_count == 0 {
                let content_path = self.content_dir.join(hash);
                std::fs::remove_file(&content_path).ok();
                self.entries.remove(hash);
                return Ok(true);
            }
        }

        Ok(false)
    }

    pub fn gc(&mut self) -> AppResult<(usize, u64)> {
        let mut removed_count = 0;
        let mut removed_bytes = 0;

        let mut to_remove = Vec::new();
        for (hash, entry) in &self.entries {
            if entry.ref_count == 0 {
                to_remove.push(hash.clone());
                removed_bytes += entry.size;
            }
        }

        for hash in to_remove {
            let content_path = self.content_dir.join(&hash);
            std::fs::remove_file(&content_path).ok();
            self.entries.remove(&hash);
            removed_count += 1;
        }

        Ok((removed_count, removed_bytes))
    }

    pub fn stats(&self) -> (usize, u64) {
        let count = self.entries.len();
        let total_bytes: u64 = self.entries.values().map(|e| e.size).sum();
        (count, total_bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_content_store() {
        let temp_dir = std::env::temp_dir().join("test_content_store");
        std::fs::create_dir_all(&temp_dir).unwrap();

        let mut store = ContentStore::new(&temp_dir);

        let content1 = b"Hello, World!";
        let hash1 = store.store(content1).unwrap();
        assert!(store.get(&hash1).unwrap().is_some());

        let content2 = b"Another content";
        let hash2 = store.store(content2).unwrap();
        assert_ne!(hash1, hash2);

        // Store same content again - should increment ref count
        let hash1_again = store.store(content1).unwrap();
        assert_eq!(hash1, hash1_again);

        // Remove once - should still exist
        assert!(!store.remove(&hash1).unwrap());
        assert!(store.get(&hash1).unwrap().is_some());

        // Remove again - should be deleted
        assert!(store.remove(&hash1).unwrap());
        assert!(store.get(&hash1).unwrap().is_none());

        std::fs::remove_dir_all(temp_dir).unwrap();
    }

    #[test]
    fn test_content_store_gc() {
        let temp_dir = std::env::temp_dir().join("test_content_store_gc");
        std::fs::create_dir_all(&temp_dir).unwrap();

        let mut store = ContentStore::new(&temp_dir);

        let content = b"Test content";
        let hash = store.store(content).unwrap();

        // Manually set ref_count to 0
        if let Some(entry) = store.entries.get_mut(&hash) {
            entry.ref_count = 0;
        }

        let (removed, bytes) = store.gc().unwrap();
        assert_eq!(removed, 1);
        assert!(bytes > 0);
        assert!(store.get(&hash).unwrap().is_none());

        std::fs::remove_dir_all(temp_dir).unwrap();
    }
}
