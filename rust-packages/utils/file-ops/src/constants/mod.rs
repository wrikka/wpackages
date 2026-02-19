//! Constants for `file-ops`.
//!
//! This module defines all constant values used throughout the crate.
//! Centralizing constants makes it easier to tune performance and behavior.

/// Default buffer size for I/O operations (8 KB).
///
/// This value balances memory usage with read/write efficiency.
/// Larger buffers may improve throughput for large files but
/// increase memory pressure.
pub const DEFAULT_BUFFER_SIZE: usize = 8192;

/// Minimum buffer size allowed (512 bytes).
///
/// Buffers smaller than this may cause excessive system calls
/// and poor performance.
pub const MIN_BUFFER_SIZE: usize = 512;

/// Maximum buffer size allowed (1 MB).
///
/// This prevents excessive memory allocation.
pub const MAX_BUFFER_SIZE: usize = 1024 * 1024;

/// Default chunk size for batch operations.
///
/// Controls how many items are processed together in a batch.
pub const DEFAULT_CHUNK_SIZE: usize = 100;

/// Default maximum concurrent operations.
///
/// When set to 0, automatically uses the number of CPU cores.
pub const DEFAULT_MAX_CONCURRENT: usize = 0;

/// Default backup extension.
///
/// Used when creating backup copies of files.
pub const DEFAULT_BACKUP_EXTENSION: &str = "bak";

/// Default configuration file name.
pub const CONFIG_FILE_NAME: &str = "Config.toml";

/// Environment variable prefix for configuration.
pub const ENV_PREFIX: &str = "FILE_OPS";

/// Default cloud operation timeout in seconds.
pub const DEFAULT_CLOUD_TIMEOUT_SECONDS: u64 = 30;

/// Default log level.
pub const DEFAULT_LOG_LEVEL: &str = "info";

/// Maximum path length (OS-dependent, using conservative value).
///
/// Windows has a max path of 260 characters by default,
/// though this can be extended with UNC paths.
pub const MAX_PATH_LENGTH: usize = 4096;

/// Supported checksum algorithms.
pub mod checksum {
    /// SHA-256 algorithm name.
    pub const SHA256: &str = "sha256";

    /// BLAKE3 algorithm name.
    pub const BLAKE3: &str = "blake3";
}

/// Supported compression formats.
pub mod compression {
    /// Gzip format.
    pub const GZIP: &str = "gzip";

    /// Zstd format.
    pub const ZSTD: &str = "zstd";

    /// Bzip2 format.
    pub const BZIP2: &str = "bzip2";
}

/// File operation types.
pub mod operation {
    /// Copy operation.
    pub const COPY: &str = "copy";

    /// Move operation.
    pub const MOVE: &str = "move";

    /// Delete operation.
    pub const DELETE: &str = "delete";

    /// Sync operation.
    pub const SYNC: &str = "sync";

    /// Checksum operation.
    pub const CHECKSUM: &str = "checksum";

    /// Compress operation.
    pub const COMPRESS: &str = "compress";

    /// Decompress operation.
    pub const DECOMPRESS: &str = "decompress";

    /// Encrypt operation.
    pub const ENCRYPT: &str = "encrypt";

    /// Decrypt operation.
    pub const DECRYPT: &str = "decrypt";
}
