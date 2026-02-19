//! Random utilities for task system
//!
//! Provides utilities for generating random values, UUIDs, and selections.

use rand::Rng;
use uuid::Uuid;

/// Generate a random UUID v4
pub fn random_uuid() -> Uuid {
    Uuid::new_v4()
}

/// Generate a random alphanumeric string of given length
pub fn random_string(length: usize) -> String {
    rand::thread_rng()
        .sample_iter(rand::distributions::Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

/// Generate a random number in inclusive range
pub fn random_range(min: usize, max: usize) -> usize {
    rand::thread_rng().gen_range(min..=max)
}

/// Pick a random element from a slice
pub fn random_pick<T>(slice: &[T]) -> Option<&T> {
    if slice.is_empty() {
        return None;
    }
    let idx = random_range(0, slice.len() - 1);
    Some(&slice[idx])
}

/// Generate a random delay duration for jitter
pub fn random_jitter(base_ms: u64, jitter_ms: u64) -> std::time::Duration {
    let jitter = if jitter_ms > 0 {
        random_range(0, jitter_ms as usize) as u64
    } else {
        0
    };
    std::time::Duration::from_millis(base_ms + jitter)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_random_string() {
        let s1 = random_string(10);
        let s2 = random_string(10);

        assert_eq!(s1.len(), 10);
        assert_ne!(s1, s2);
    }

    #[test]
    fn test_random_range() {
        for _ in 0..100 {
            let value = random_range(1, 10);
            assert!(value >= 1 && value <= 10);
        }
    }

    #[test]
    fn test_random_pick() {
        let items = vec![1, 2, 3, 4, 5];
        let pick = random_pick(&items);
        assert!(pick.is_some());
        assert!(items.contains(pick.unwrap()));

        let empty: Vec<i32> = vec![];
        assert!(random_pick(&empty).is_none());
    }
}
