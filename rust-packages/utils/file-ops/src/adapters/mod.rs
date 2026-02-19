//! Adapters for `file-ops`.
//!
//! This module contains wrappers around external libraries to provide
//! consistent interfaces and facilitate testing. Adapters:
//! - Wrap third-party crates
//! - Provide trait implementations
//! - Abstract platform-specific details
//! - Enable mocking in tests

/// Cryptography adapters.
pub mod crypto {
    // Re-export wrapped crypto operations
    // These would wrap sha2, blake3, aes-gcm, rand
}

/// Compression adapters.
pub mod compression {
    // Re-export wrapped compression operations
    // These would wrap flate2, zstd, bzip2
}

/// Storage adapters.
pub mod storage {
    // Re-export wrapped storage operations
    // These would wrap object_store for cloud storage
}

/// File system adapters.
pub mod fs {
    // Re-export wrapped file system operations
    // These would wrap fs2, walkdir, notify
}
