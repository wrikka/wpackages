//! Hashing utilities

/// FNV-1a hash for session names
pub fn fnv1a_hash(input: &str) -> u32 {
    let mut hash: u32 = 2166136261;
    for byte in input.bytes() {
        hash ^= byte as u32;
        hash = hash.wrapping_mul(16777619);
    }
    hash
}

/// Simple hash for port derivation
pub fn hash_to_port(hash: u32, min: u16, max: u16) -> u16 {
    let range = (max - min) as u32;
    min + ((hash % range) as u16)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fnv1a_hash() {
        let hash1 = fnv1a_hash("default");
        let hash2 = fnv1a_hash("test");
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_hash_to_port() {
        let hash = fnv1a_hash("default");
        let port = hash_to_port(hash, 40000, 60000);
        assert!(port >= 40000);
        assert!(port <= 60000);
    }
}
