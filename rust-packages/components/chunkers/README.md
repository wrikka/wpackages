# Chunking Strategies Library

## Introduction

Advanced chunking strategies for document processing including recursive, semantic, and code-aware chunking. This library provides multiple strategies to split documents into optimal chunks for processing by AI systems, embeddings generation, or storage in vector databases.

## Features

- 🔄 **Recursive Chunking** - Hierarchical chunking with configurable sizes
- 🧠 **Semantic Chunking** - Content-aware chunking based on meaning
- 💻 **Code-Aware Chunking** - Specialized chunking for code files
- ⚙️ **Configurable** - Adjustable chunk sizes and overlaps
- 📊 **Multiple Strategies** - Choose the best strategy for your use case
- 🔍 **Metadata** - Preserve metadata in chunks
- ⚡ **Fast** - Optimized for performance
- 🎯 **Unified Trait** - Common `Chunker` trait for all implementations

## Goal

- 🎯 Provide flexible document chunking for RAG systems
- 🧠 Enable semantic-aware document splitting
- 💻 Support code-specific chunking strategies
- ⚡ Optimize for large document processing

## Design Principles

- 🔄 **Flexible** - Support multiple chunking strategies
- 🧠 **Intelligent** - Content-aware chunking
- 💻 **Context-aware** - Understand code structure
- ⚡ **Efficient** - Fast processing of large documents

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
chunking-strategies = { path = "../chunking-strategies" }
```

## Usage

### Using the Chunker Trait

All chunkers implement the `Chunker` trait:

```rust
use chunking_strategies::{Chunker, ChunkOutput, RecursiveChunker, SemanticChunker, CodeAwareChunker};

fn process_with_chunker(chunker: &dyn Chunker, text: &str) {
    let result = chunker.chunk(text).unwrap();
    println!("Strategy: {:?}", chunker.strategy());
    println!("Chunks: {}", result.total_chunks);
}
```

### Recursive Chunking

```rust
use chunking_strategies::{RecursiveChunker, ChunkingConfig, Chunker};

let config = ChunkingConfig {
    chunk_size: 1000,
    chunk_overlap: 200,
    ..Default::default()
};

let chunker = RecursiveChunker::new(config);
let result = chunker.chunk("Your long document text here...")?;

for (i, chunk) in result.chunks.iter().enumerate() {
    println!("Chunk {}: {} chars", i, chunk.content.len());
}
```

### Semantic Chunking

```rust
use chunking_strategies::{SemanticChunker, Chunker};

let chunker = SemanticChunker::default();
let result = chunker.chunk("This is sentence one. This is sentence two.")?;
```

### Code-Aware Chunking

```rust
use chunking_strategies::{CodeAwareChunker, Chunker};

let chunker = CodeAwareChunker::new(Default::default(), "rs");
let code = r#"
fn main() {
    println!("Hello");
}

fn test() {
    println!("World");
}
"#;
let result = chunker.chunk(code)?;
```

## Supported Languages for Code-Aware Chunking

| Language | Extension | Pattern Matched |
|----------|-----------|-----------------|
| Rust | `rs` | `fn`, `impl`, `struct`, `mod` |
| Python | `py` | `def`, `class` |
| JavaScript/TypeScript | `js`, `ts` | `function`, `class`, `const` |
| Java | `java` | `public`, `class`, `interface` |
| Go | `go` | `func`, `type`, `struct` |
| C/C++ | `c`, `cpp`, `h`, `hpp` | functions, `class`, `struct` |

## Configuration

```rust
use chunking_strategies::ChunkingConfig;

let config = ChunkingConfig {
    chunk_size: 512,        // Target chunk size in characters
    chunk_overlap: 50,      // Overlap between chunks
    min_chunk_size: 100,    // Minimum chunk size
    max_chunk_size: 2048,   // Maximum chunk size
    separators: vec![       // Priority order for splitting
        "\n\n".to_string(),
        "\n".to_string(),
        ". ".to_string(),
        " ".to_string(),
    ],
};
```

## Output Structure

```rust
pub struct ChunkOutput {
    pub chunks: Vec<Chunk>,
    pub total_chunks: usize,
    pub total_tokens: usize,
    pub strategy: ChunkingStrategy,
}

pub struct Chunk {
    pub id: String,
    pub content: String,
    pub start_index: usize,
    pub end_index: usize,
    pub metadata: ChunkMetadata,
}
```

## Development

```bash
cargo build
cargo test
cargo clippy
```

## License

MIT
