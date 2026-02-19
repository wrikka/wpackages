# Semantic Search

Vector similarity search library with multiple distance metrics and parallel processing support.

## Introduction

Vector Search provides efficient vector similarity search capabilities for wterminal IDE. It supports multiple distance metrics including Euclidean, Cosine, and Manhattan distances, with parallel processing for high-performance searches. This library is essential for implementing semantic search, recommendations, and similarity-based features.

## Features

- 🔍 **Multiple Distance Metrics** - Euclidean, Cosine, Manhattan, and more
- ⚡ **Parallel Processing** - Fast search using rayon
- 💾 **Caching Support** - Built-in caching integration
- 📊 **Batch Operations** - Process multiple vectors efficiently
- 🔧 **Configurable** - Flexible configuration options
- 🎯 **Type-Safe** - Full Rust type safety

## Goal

- 🎯 Provide efficient vector similarity search for wterminal IDE
- ⚡ Enable high-performance semantic search
- 📊 Support various distance metrics
- 💾 Integrate with caching for optimization

## Design Principles

- ⚡ **Performance** - Optimized for speed
- 🔍 **Accuracy** - Precise similarity calculations
- 🔄 **Flexible** - Support various use cases
- 💾 **Efficient** - Memory-conscious implementation

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
semantic-search = { path = "../semantic-search" }
cache = { path = "../cache" }
```

## Usage

### Basic Search

```rust
use semantic_search::{VectorIndex, VectorSearchConfig, SearchQuery, DistanceMetric};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = VectorSearchConfig::new(3);
    let mut index = VectorIndex::new(config)?;
    
    // Add vectors
    index.add(vec![1.0, 2.0, 3.0], None)?;
    index.add(vec![4.0, 5.0, 6.0], None)?;
    
    // Search
    let query = vec![1.5, 2.5, 3.5];
    let results = index.search(SearchQuery::new(query, 5))?;
    
    for result in results {
        println!("Index: {}, Score: {}", result.index, result.score);
    }
    
    Ok(())
}
```

### Different Distance Metrics

```rust
use semantic_search::{VectorIndex, VectorSearchConfig, DistanceMetric};

// Euclidean distance
let config_euclidean = VectorSearchConfig::new(3).with_metric(DistanceMetric::Euclidean);
let index_euclidean = VectorIndex::new(config_euclidean)?;

// Cosine similarity
let config_cosine = VectorSearchConfig::new(3).with_metric(DistanceMetric::Cosine);
let index_cosine = VectorIndex::new(config_cosine)?;

// Manhattan distance
let config_manhattan = VectorSearchConfig::new(3).with_metric(DistanceMetric::Manhattan);
let index_manhattan = VectorIndex::new(config_manhattan)?;
```

### Batch Operations

```rust
use semantic_search::{VectorIndex, VectorSearchConfig};

let config = VectorSearchConfig::new(3);
let mut index = VectorIndex::new(config)?;

// Add multiple vectors
let vectors = vec![
    vec![1.0, 2.0, 3.0],
    vec![4.0, 5.0, 6.0],
    vec![7.0, 8.0, 9.0],
];
let metadata = vec![None, None, None];

index.add_batch(vectors, metadata)?;
```

## Examples

### Semantic Search

```rust
use semantic_search::{VectorIndex, VectorSearchConfig, SearchQuery, DistanceMetric};

let config = VectorSearchConfig::new(768).with_metric(DistanceMetric::Cosine);
let mut index = VectorIndex::new(config)?;

// Index documents with their embeddings
for doc in documents {
    let embedding = generate_embedding(&doc.content)?;
    index.add(embedding, Some(serde_json::json!({"id": doc.id, "title": doc.title})))?;
}

// Find similar documents
let query_embedding = generate_embedding("search query")?;
let similar = index.search(SearchQuery::new(query_embedding, 10))?;

for result in similar {
    println!("Similar document: {}, Score: {}", result.metadata["id"], result.score);
}
```

### Recommendation System

```rust
use semantic_search::{VectorIndex, VectorSearchConfig, SearchQuery, DistanceMetric};

let config = VectorSearchConfig::new(128).with_metric(DistanceMetric::Cosine);
let mut index = VectorIndex::new(config)?;

// Index items by their feature vectors
for item in items {
    let features = extract_features(&item)?;
    index.add(features, Some(serde_json::json!({"id": item.id, "name": item.name})))?;
}

// Recommend similar items
let item_features = extract_features(&current_item)?;
let recommendations = index.search(SearchQuery::new(item_features, 5))?;
```

### Caching Results

```rust
use semantic_search::{VectorIndex, VectorSearchConfig, SearchQuery, cache::SearchCache};

let config = VectorSearchConfig::new(768);
let mut index = VectorIndex::new(config)?;
let cache = SearchCache::new(1000, 3600);

// Search with caching
let query = SearchQuery::new(query_vector, 5);
let key = cache::SearchCacheKey::from_query(&query);

if let Some(cached) = cache.get(&key).await? {
    println!("Using cached results");
} else {
    let results = index.search(query)?;
    cache.set(key, results.clone()).await?;
    println!("Computed and cached results");
}
```

## License

MIT
