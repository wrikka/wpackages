//! Hashing utilities for task deduplication and integrity
//!
//! Uses BLAKE3 for fast, secure hashing of task data.

use blake3::Hash;

/// Hash a byte slice and return hex string
pub fn hash_bytes(data: &[u8]) -> String {
    blake3::hash(data).to_hex().to_string()
}

/// Hash a string and return hex string
pub fn hash_string(s: &str) -> String {
    hash_bytes(s.as_bytes())
}

/// Hash multiple items together with separator
pub fn hash_combine(items: &[&str]) -> String {
    let combined = items.join("|");
    hash_string(&combined)
}

/// Hash a task by its key properties for deduplication
pub fn hash_task(name: &str, payload: &str, tags: &[String]) -> String {
    let mut items = vec![name, payload];
    for tag in tags {
        items.push(tag);
    }
    hash_combine(&items)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_string() {
        let hash1 = hash_string("hello");
        let hash2 = hash_string("hello");
        let hash3 = hash_string("world");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
        assert_eq!(hash1.len(), 64);
    }

    #[test]
    fn test_hash_combine() {
        let hash1 = hash_combine(&["a", "b", "c"]);
        let hash2 = hash_combine(&["a", "b", "c"]);
        let hash3 = hash_combine(&["a", "b", "d"]);

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }

    #[test]
    fn test_hash_task() {
        let hash1 = hash_task("task1", "payload", &["tag1".to_string(), "tag2".to_string()]);
        let hash2 = hash_task("task1", "payload", &["tag1".to_string(), "tag2".to_string()]);
        let hash3 = hash_task("task1", "different", &["tag1".to_string()]);

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
}
