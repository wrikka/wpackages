//! Provides functions for file compression and decompression.
//!
//! This module supports Gzip, Zstd, and Bzip2 formats.

use crate::error::{Error, Result};
use camino::Utf8Path;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression as GzipCompression;
use bzip2::read::BzDecoder;
use bzip2::write::BzEncoder;
use bzip2::Compression as Bzip2Compression;
use std::fs::File;
use zstd::stream::read::Decoder as ZstdDecoder;
use zstd::stream::write::Encoder as ZstdEncoder;

/// Defines the compression level.
#[derive(Debug, Clone, Copy, Default)]
pub enum CompressionLevel {
    /// Default compression level, balancing speed and compression ratio.
    #[default]
    Default,
    /// Fastest compression level, sacrificing compression ratio for speed.
    Fastest,
    /// Best compression level, sacrificing speed for the best compression ratio.
    Best,
    /// A custom compression level.
    /// For Gzip, this is typically 0-9.
    /// For Zstd, this can be 1-21.
    Custom(u32),
}

/// Options for compression.
#[derive(Debug, Clone, Copy, Default)]
pub struct CompressionOptions {
    /// The compression level to use.
    pub level: CompressionLevel,
}

/// Compresses a file using Gzip.
///
/// # Example
///
/// ```no_run
/// use file_ops::{compress_gzip, CompressionOptions};
/// use camino::Utf8Path;
///
/// let from = Utf8Path::new("source.txt");
/// let to = Utf8Path::new("archive.gz");
/// compress_gzip(from, to, &Default::default()).unwrap();
/// ```
pub fn compress_gzip(from: &Utf8Path, to: &Utf8Path, options: &CompressionOptions) -> Result<()> {
    let level = match options.level {
        CompressionLevel::Default => GzipCompression::default(),
        CompressionLevel::Fastest => GzipCompression::fast(),
        CompressionLevel::Best => GzipCompression::best(),
        CompressionLevel::Custom(level) => GzipCompression::new(level.min(9)),
    };
    let mut input_file = File::open(from)?;
    let output_file = File::create(to)?;
    let mut encoder = GzEncoder::new(output_file, level);
    std::io::copy(&mut input_file, &mut encoder)?;
    encoder.finish()?;
    Ok(())
}

/// Decompresses a Gzip file.
pub fn decompress_gzip(from: &Utf8Path, to: &Utf8Path) -> Result<()> {
    let input_file = File::open(from)?;
    let mut decoder = GzDecoder::new(input_file);
    let mut output_file = File::create(to)?;
    std::io::copy(&mut decoder, &mut output_file)?;
    Ok(())
}

/// Compresses a file using Zstd.
pub fn compress_zstd(from: &Utf8Path, to: &Utf8Path, options: &CompressionOptions) -> Result<()> {
    let level = match options.level {
        CompressionLevel::Default => 0,
        CompressionLevel::Fastest => 1,
        CompressionLevel::Best => 21,
        CompressionLevel::Custom(level) => level as i32,
    };
    let mut input_file = File::open(from)?;
    let output_file = File::create(to)?;
    let mut encoder = ZstdEncoder::new(output_file, level)?;
    std::io::copy(&mut input_file, &mut encoder)?;
    encoder.finish()?;
    Ok(())
}

/// Decompresses a Zstd file.
pub fn decompress_zstd(from: &Utf8Path, to: &Utf8Path) -> Result<()> {
    let input_file = File::open(from)?;
    let mut decoder = ZstdDecoder::new(input_file)?;
    let mut output_file = File::create(to)?;
    std::io::copy(&mut decoder, &mut output_file)?;
    Ok(())
}

/// Compresses a file using Bzip2.
pub fn compress_bzip2(from: &Utf8Path, to: &Utf8Path, options: &CompressionOptions) -> Result<()> {
    let level = match options.level {
        CompressionLevel::Default => Bzip2Compression::default(),
        CompressionLevel::Fastest => Bzip2Compression::fast(),
        CompressionLevel::Best => Bzip2Compression::best(),
        CompressionLevel::Custom(_) => Bzip2Compression::best(), // bzip2 doesn't support custom levels
    };
    let mut input_file = File::open(from)?;
    let output_file = File::create(to)?;
    let mut encoder = BzEncoder::new(output_file, level);
    std::io::copy(&mut input_file, &mut encoder)?;
    encoder.finish()?;
    Ok(())
}

/// Decompresses a Bzip2 file.
pub fn decompress_bzip2(from: &Utf8Path, to: &Utf8Path) -> Result<()> {
    let input_file = File::open(from)?;
    let mut decoder = BzDecoder::new(input_file);
    let mut output_file = File::create(to)?;
    std::io::copy(&mut decoder, &mut output_file)?;
    Ok(())
}


#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn helper_test_compression_roundtrip(
        compress_fn: impl Fn(&Utf8Path, &Utf8Path, &CompressionOptions) -> Result<()>, 
        decompress_fn: impl Fn(&Utf8Path, &Utf8Path) -> Result<()>, 
        extension: &str, 
        options: &CompressionOptions
    ) -> Result<()> {
        let dir = tempdir()?;
        let original_path = Utf8Path::from_path(dir.path()).unwrap().join("original.txt");
        let compressed_path = Utf8Path::from_path(dir.path()).unwrap().join(format!("compressed.{}", extension));
        let decompressed_path = Utf8Path::from_path(dir.path()).unwrap().join("decompressed.txt");
        let content = "hello world".repeat(1000);
        std::fs::write(&original_path, &content)?;

        compress_fn(&original_path, &compressed_path, options)?;
        assert!(compressed_path.exists());

        decompress_fn(&compressed_path, &decompressed_path)?;
        assert!(decompressed_path.exists());

        let decompressed_content = std::fs::read_to_string(&decompressed_path)?;
        assert_eq!(content, decompressed_content);
        Ok(())
    }

    #[test]
    fn test_gzip_compression_decompress() -> Result<()> {
        helper_test_compression_roundtrip(compress_gzip, decompress_gzip, "gz", &Default::default())
    }

    #[test]
    fn test_zstd_compression_decompress() -> Result<()> {
        helper_test_compression_roundtrip(compress_zstd, decompress_zstd, "zst", &CompressionOptions { level: CompressionLevel::Custom(3) })
    }

    #[test]
    fn test_bzip2_compression_decompress() -> Result<()> {
        helper_test_compression_roundtrip(compress_bzip2, decompress_bzip2, "bz2", &Default::default())
    }
}
