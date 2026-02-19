# wdocs-search

A blazingly fast, in-memory full-text search engine written in Rust, with Node.js bindings provided by `napi-rs`.

This search engine is optimized for extreme performance, focusing on fast indexing and searching of document-based content like Markdown files, articles, and other text-heavy data.

## Core Focus

- **Performance:** The primary goal is to be one of the fastest in-memory search solutions available. It leverages advanced data structures like Finite State Transducers (FSTs) and Roaring Bitmaps to achieve this.
- **Document Search:** Specifically designed for searching collections of documents, where each document has multiple text fields (e.g., `title`, `body`).
- **Simple API:** Provides a straightforward API for adding documents, building the index, and performing searches.

## Features

- **Full-Text Search:** Standard full-text search capabilities.
- **In-Memory Indexing:** All data is held in memory for maximum query speed.
- **Builder Pattern:** Documents are added to a builder, and the final, immutable index is constructed in a separate `build` step.
- **Parallel Index Construction:** Utilizes `rayon` to build the index in parallel, significantly speeding up the indexing process for large datasets.
- **Node.js Integration:** Seamlessly integrates with Node.js projects via a high-performance N-API addon.

## Benchmarks

This engine is benchmarked against other top-tier search solutions:

- **Rust:** `tantivy`
- **Node.js:** `FlexSearch.js`, `Meilisearch`
- **CLI:** `ripgrep`

To run the full benchmark suite:

```bash
bun run bench:all
```

This will generate a `result.html` file in the `benches` directory with a detailed performance comparison.
