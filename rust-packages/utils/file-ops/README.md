# file-ops

Safe and fast file operations library for Rust.

## Features

- Atomic writes
- Sync file copy/move/delete with overwrite/skip/backup options
- Parallel batch copy (rayon)
- Async helpers (tokio)
- Checksums (SHA-256, BLAKE3)
- Compression (gzip, zstd)
- File system watcher (notify)
- Cloud object store wrapper (object_store)

## Install

Add as a dependency:

```toml
[dependencies]
file-ops = { path = "../file-ops" }
```

## Quick Start

### Atomic write

```rust
use camino::Utf8Path;
use file_ops::atomic_write;

let path = Utf8Path::new("/tmp/example.txt");
atomic_write(path, b"hello")?;
# Ok::<(), file_ops::Error>(())
```

### Copy with options

```rust
use camino::Utf8Path;
use file_ops::{copy, CopyOptions};

let from = Utf8Path::new("/tmp/from.bin");
let to = Utf8Path::new("/tmp/to.bin");

let options = CopyOptions {
    overwrite: true,
    backup: true,
    ..Default::default()
};

copy(from, to, &options)?;
# Ok::<(), file_ops::Error>(())
```

### Checksums

```rust
use camino::Utf8Path;
use file_ops::{sha256, blake3};

let path = Utf8Path::new("/tmp/example.bin");
let _sha = sha256(path)?;
let _b3 = blake3(path)?;
# Ok::<(), file_ops::Error>(())
```

### Compression

```rust
use camino::Utf8Path;
use file_ops::{compress_gzip, decompress_gzip, compress_zstd, decompress_zstd};

let from = Utf8Path::new("/tmp/from.txt");
let gz = Utf8Path::new("/tmp/from.txt.gz");
let out = Utf8Path::new("/tmp/out.txt");

compress_gzip(from, gz)?;
decompress_gzip(gz, out)?;

let zst = Utf8Path::new("/tmp/from.txt.zst");
compress_zstd(from, zst, 3)?;
decompress_zstd(zst, out)?;
# Ok::<(), file_ops::Error>(())
```

### Watcher

```rust
use camino::Utf8Path;
use file_ops::watch;

let dir = Utf8Path::new("/tmp");
let (_watcher, _rx) = watch(dir)?;
# Ok::<(), file_ops::Error>(())
```

### CloudStore

```rust
use bytes::Bytes;
use file_ops::CloudStore;

let store = CloudStore::new("s3://my-bucket")?;
store.put("path/to/object.bin", Bytes::from("hello")).await?;
let _data = store.get("path/to/object.bin").await?;
# Ok::<(), file_ops::Error>(())
```

## Development

```bash
cargo test -p file-ops
```

## License

MIT
