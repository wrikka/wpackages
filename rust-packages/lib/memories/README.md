# AI Memories

A highly-performant, scalable, and adaptable memory system for AI agents, built with SOLID principles in Rust. This library provides a sophisticated framework for creating, managing, and retrieving information in a way that mimics aspects of human memory.

It is founded on core mathematical principles to ensure efficiency and semantic understanding. For a deeper dive into the theory, please see [`MATH_CONCEPts.md`](./MATH_CONCEPTS.md).

## Core Features

- **SOLID Architecture:** Fully decoupled components for storage, indexing, and decay strategies, allowing for easy extension and maintenance.
- **Semantic Search:** Utilizes Locality-Sensitive Hashing (`LshIndex`) for fast, approximate nearest-neighbor search in high-dimensional vector space.
- **Context-Aware Retrieval:** The search mechanism can prioritize results based on their relationship to a given context, leveraging the `MemoryGraph`.
- **Spaced Repetition Model:** Implements a sophisticated forgetting curve (`SpacedRepetitionDecay`) where memories become more stable and resistant to decay with each access.
- **Emotional Tagging:** Memories can be associated with an emotional valence (e.g., `Positive`, `Curiosity`), adding another layer of context.
- **Multi-modal Content:** Designed to store various types of information, including text, images, and audio (`MemoryContent` enum).
- **Memory Consolidation:** Provides a mechanism to abstract and summarize clusters of related memories into a single, higher-level concept.

## Quick Start

First, add `ai-memories` to your `Cargo.toml` dependencies.

```toml
[dependencies]
ai-memories = { path = "/path/to/ai-memories" } # Or from a git repository/crates.io
```

Then, you can easily set up and interact with the `MemorySystem`:

```rust
use ai_memories::{
    MemorySystem,
    HashMapMemoryStore,
    LshIndex,
    SpacedRepetitionDecay,
    MemoryContent,
    Emotion,
};

// 1. Define the vector dimension for your embeddings
const VECTOR_DIM: usize = 3;

// 2. Choose and instantiate your components
let store = Box::new(HashMapMemoryStore::new());
let index = Box::new(LshIndex::new(16, 10, VECTOR_DIM));

// 3. Create the main MemorySystem
let mut system = MemorySystem::new(store, index);

// 4. Add memories with content, an embedding vector, and an optional emotion
system.add_memory(
    MemoryContent::Text("The sky is blue.".to_string()),
    vec![0.1, 0.2, 0.9], // Embedding for "The sky is blue."
    Some(Emotion::Neutral)
);

let id_king = system.add_memory(
    MemoryContent::Text("King".to_string()),
    vec![0.9, 0.8, 0.1],
    None
);

// 5. Perform a context-aware search
let query_vec = vec![0.88, 0.79, 0.11]; // Embedding for "royal"
let results = system.search(&query_vec, 1, Some(id_king));

if let Some((top_result, score)) = results.first() {
    if let MemoryContent::Text(text) = &top_result.content {
        println!("Found memory: '{}' with score: {}", text, score);
    }
}

// 6. Apply a decay strategy periodically
let decay_strategy = SpacedRepetitionDecay::new(86400.0); // 1-day base half-life
system.apply_decay(&decay_strategy);
```

## Future Development

We have a roadmap of exciting features to make this library even more powerful. Check them out in [`FEATURES.md`](./FEATURES.md).
