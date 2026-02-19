# CodeSearch (Rust)

Universal code search engine for the WAI monorepo.

This package provides a single CLI + daemon that can fan out to multiple search layers:

- Text search (default)
- Syntax/AST search (tree-sitter, optional)
- Symbol search (placeholder, optional)
- Semantic search (placeholder, optional)

## Requirements

- Rust toolchain

## Install / Build

```bash
cargo check -p codesearch
```

## CLI Usage

### Text search (default)

```bash
cargo run -p codesearch -- search --root . --pattern TODO --limit 20
```

Regex mode:

```bash
cargo run -p codesearch -- search --root . --pattern "fn\\s+\\w+" --regex --limit 20
```

### Syntax search (tree-sitter)

Enable `syntax` feature:

```bash
cargo run -p codesearch --features syntax -- search-syntax --root . --query "(function_item name: (identifier) @name)" --limit 20
```

Restrict to a specific language (examples: `rust`, `ts`, `tsx`, `js`, `python`, `go`):

```bash
cargo run -p codesearch --features syntax -- search-syntax --root . --language rust --query "(function_item name: (identifier) @name)" --limit 20
```

### Symbol search

Enable `symbol` feature:

```bash
cargo run -p codesearch --features symbol -- search-symbol --root . --query my_function --limit 20
```

### Semantic search

Enable `semantic` feature:

```bash
cargo run -p codesearch --features semantic -- search-semantic --root . --query "how to parse json" --limit 20
```

Semantic search requires an embeddings server. Start the server in another terminal:

```bash
cargo run -p embeddings --bin embeddings-server
```

Optionally override the endpoint:

```bash
set EMBEDDINGS_URL=http://127.0.0.1:3000/embeddings
```

Note: semantic search will call the embeddings server twice (chunks + query).

## Semantic Cache

Semantic search uses a persistent local cache (sled) by default to avoid re-embedding the same snippets.

Environment variables (PowerShell):

```bash
set CODESEARCH_SEMANTIC_CACHE=1
set CODESEARCH_SEMANTIC_CACHE_PATH=.codesearch/semantic-cache
```

Disable cache:

```bash
set CODESEARCH_SEMANTIC_CACHE=0
```

## Semantic Index

You can build a persistent semantic index so searches do not need to re-chunk and re-embed the workspace every time.

Build index:

```bash
cargo run -p codesearch --features semantic -- index-semantic --root .
```

Control index usage:

```bash
set CODESEARCH_SEMANTIC_INDEX=1
set CODESEARCH_SEMANTIC_INDEX_PATH=.codesearch/semantic-index
```

Disable index (fall back to on-the-fly chunking):

```bash
set CODESEARCH_SEMANTIC_INDEX=0
```

## Daemon

Start daemon:

```bash
cargo run -p codesearch -- daemon --bind 127.0.0.1:7878
```

The daemon uses a JSON-lines protocol over TCP:

Request:

```json
{"id":"1","action":{"type":"SearchText"},"params":{"root":".","pattern":"TODO","regex":false,"limit":20}}
```

Response:

```json
{"id":"1","success":true,"data":{"matches":[{"path":"...","line":1,"text":"..."}]},"error":null}
```

Supported actions:

- `SearchText`
- `SearchSyntax`
- `SearchSymbol`
- `SearchSemantic`

## Notes

- Text search currently skips non-UTF8 files.
- Syntax search uses tree-sitter queries and supports a small built-in language set initially.
