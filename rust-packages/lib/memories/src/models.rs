//! Core data structures for the AI memory system.

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

// --- Constants for Memory --- //
const INITIAL_STRENGTH: f64 = 1.0;
const INITIAL_STABILITY: f64 = 1.0;
const STABILITY_INCREASE_FACTOR: f64 = 0.2;

// Represents a unique identifier for a memory.
pub type MemoryId = u64;

// The vector representation of a memory's content.
pub type Embedding = Vec<f32>;

/// Represents an emotional valence associated with a memory.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Emotion {
    Positive,
    Negative,
    Neutral,
    Surprise,
    Curiosity,
}

/// Represents the actual content of a memory.
#[derive(Debug, Clone)]
pub enum MemoryContent {
    Text(String),
    Image(PathBuf),
    Audio(PathBuf),
}

/// Represents a single unit of memory in the system.
#[derive(Debug, Clone)]
pub struct Memory {
    pub id: MemoryId,
    pub content: MemoryContent,
    pub embedding: Embedding,
    pub created_at: u64,      // Unix timestamp
    pub last_accessed_at: u64, // Unix timestamp
    pub strength: f64,        // A score representing relevance, from 0.0 to 1.0
    pub stability: f64,       // A measure of how stable the memory is (resists forgetting)
    pub emotion: Option<Emotion>, // The emotional context of the memory
}

/// A specialized Result type for memory operations.
pub type MemoryResult<T> = Result<T, &'static str>;

/// Returns the current Unix timestamp in seconds.
fn current_timestamp() -> MemoryResult<u64> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .map_err(|_| "Time went backwards")
}

impl Memory {
    /// Creates a new memory with a given ID, content, and embedding.
    pub fn new(
        id: MemoryId,
        content: MemoryContent,
        embedding: Embedding,
        emotion: Option<Emotion>,
    ) -> MemoryResult<Self> {
        let now = current_timestamp()?;
        Ok(Memory {
            id,
            content,
            embedding,
            created_at: now,
            last_accessed_at: now,
            strength: INITIAL_STRENGTH,
            stability: INITIAL_STABILITY,
            emotion,
        })
    }

    /// Updates the last access time, resets strength, and increases stability.
    pub fn touch(&mut self) -> MemoryResult<()> {
        self.last_accessed_at = current_timestamp()?;

        // On access, the memory is fully recalled, so its strength is reset to maximum.
        self.strength = INITIAL_STRENGTH;

        // Stability increases based on the principle of spaced repetition.
        // The increase is larger for less stable memories.
        self.stability += (1.0 - self.stability) * STABILITY_INCREASE_FACTOR;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn touch_should_update_access_time_and_strength() {
        let mut memory = Memory::new(
            1,
            MemoryContent::Text("test".to_string()),
            vec![1.0],
            None,
        )
        .unwrap();

        let initial_stability = memory.stability;
        std::thread::sleep(std::time::Duration::from_secs(1));
        memory.touch().unwrap();

        assert!(memory.last_accessed_at > memory.created_at);
        assert_eq!(memory.strength, INITIAL_STRENGTH);
        assert!(memory.stability > initial_stability);
    }
}
