//! Pure components for `file-ops`.
//!
//! This module contains pure functions that implement domain logic
//! without any side effects. These functions:
//! - Take all inputs through parameters
//! - Return all outputs through return values
//! - Do not perform I/O operations
//! - Do not mutate global state

/// Path manipulation and validation (pure logic).
pub mod path {
    pub use crate::path::clean_path;
}

/// Checksum calculation (pure computation).
pub mod checksum {
    pub use crate::checksum::{ChecksumAlgorithm, Sha256, Blake3, checksum};
}

/// Compression/decompression (pure transformation).
pub mod compression {
    pub use crate::compression::{
        CompressionOptions, CompressionLevel,
        compress_gzip, compress_zstd, compress_bzip2,
        decompress_gzip, decompress_zstd, decompress_bzip2,
    };
}

/// Encryption/decryption (pure transformation).
pub mod encryption {
    pub use crate::encryption::{encrypt, decrypt};
}

/// MIME type detection (pure lookup).
pub mod mime {
    pub use crate::mime::guess_mime_type;
}

/// Patching operations (pure diff/apply).
pub mod patch {
    pub use crate::patch::{create_patch, apply_patch};
}
