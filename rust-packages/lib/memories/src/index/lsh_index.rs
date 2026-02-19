//! Locality-Sensitive Hashing for fast approximate nearest neighbor search.

use std::collections::{HashMap, HashSet};
use crate::models::{Embedding, MemoryId};
use rand_distr::{Distribution, Normal};
use super::VectorIndex;
use rand::thread_rng;

/// A single LSH hash plane.
/// A vector is hashed based on which side of this plane it falls on.
#[derive(Debug)]
struct LshPlane {
    plane: Embedding,
}

impl LshPlane {
    /// Creates a new random plane with a given dimension.
    fn new(dim: usize) -> Self {
        let mut rng = thread_rng();
        let normal = Normal::new(0.0, 1.0).expect("Invalid normal distribution params");
        let plane = (0..dim).map(|_| normal.sample(&mut rng) as f32).collect();
        LshPlane { plane }
    }

    /// Calculates the dot product of the plane and a vector.
    fn dot(&self, vec: &Embedding) -> f32 {
        self.plane.iter().zip(vec).map(|(a, b)| a * b).sum()
    }

    /// Hashes the vector. Returns true if the dot product is positive, false otherwise.
    fn hash(&self, vec: &Embedding) -> bool {
        self.dot(vec) >= 0.0
    }
}

/// A set of LSH planes that together create a single hash signature.
#[derive(Debug)]
struct LshHasher {
    planes: Vec<LshPlane>,
}

impl LshHasher {
    /// Creates a new hasher with a specified number of planes (hash bits) and dimensions.
    fn new(num_planes: usize, dim: usize) -> Self {
        let planes = (0..num_planes).map(|_| LshPlane::new(dim)).collect();
        LshHasher { planes }
    }

    /// Creates a hash signature (a u64) for a given vector.
    fn hash_vec(&self, vec: &Embedding) -> u64 {
        self.planes.iter().enumerate().fold(0, |acc, (i, plane)| {
            if plane.hash(vec) {
                acc | (1 << i)
            } else {
                acc
            }
        })
    }
}

/// The main LSH index structure.
/// It contains multiple hash tables (hashers) to increase the probability of finding neighbors.
#[derive(Debug)]
pub struct LshIndex {
    hashers: Vec<LshHasher>,
    hash_tables: Vec<HashMap<u64, HashSet<MemoryId>>>,
    dim: usize,
}

impl LshIndex {
    /// Creates a new LSH index.
    /// - `num_tables`: Number of hash tables. More tables increase accuracy but use more memory.
    /// - `num_planes`: Number of hash planes per table. More planes create more specific buckets.
    /// - `dim`: The dimension of the vectors to be indexed.
    pub fn new(num_tables: usize, num_planes: usize, dim: usize) -> Self {
        assert!(num_planes <= 64, "Number of planes cannot exceed 64");
        let hashers = (0..num_tables).map(|_| LshHasher::new(num_planes, dim)).collect();
        let hash_tables = vec![HashMap::new(); num_tables];
        LshIndex { hashers, hash_tables, dim }
    }

    /// Adds a vector (represented by its MemoryId) to the index.
    fn add(&mut self, id: MemoryId, vec: &Embedding) {
        assert_eq!(vec.len(), self.dim, "Vector dimension mismatch");
        for (i, hasher) in self.hashers.iter().enumerate() {
            let hash = hasher.hash_vec(vec);
            self.hash_tables[i].entry(hash).or_default().insert(id);
        }
    }

    /// Queries the index to find candidate nearest neighbors for a given vector.
    /// This returns a set of MemoryIds that are likely to be close to the query vector.
    fn query(&self, vec: &Embedding) -> HashSet<MemoryId> {
        assert_eq!(vec.len(), self.dim, "Vector dimension mismatch");
        let mut candidates = HashSet::new();
        for (i, hasher) in self.hashers.iter().enumerate() {
            let hash = hasher.hash_vec(vec);
            if let Some(ids) = self.hash_tables[i].get(&hash) {
                candidates.extend(ids);
            }
        }
        candidates
    }
}

impl VectorIndex for LshIndex {
    fn add(&mut self, id: MemoryId, vec: &Embedding) {
        self.add(id, vec);
    }

    fn query(&self, vec: &Embedding) -> HashSet<MemoryId> {
        self.query(vec)
    }
}
