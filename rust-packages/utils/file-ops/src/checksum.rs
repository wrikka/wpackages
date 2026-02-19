use crate::error::{Error, Result};
use camino::Utf8Path;
use sha2::{Digest, Sha256 as Sha256Hasher};
use std::fs::File;

/// A trait for checksum algorithms, allowing for pluggable hashing implementations.
pub trait ChecksumAlgorithm {
    /// Calculates the checksum of a file.
    fn calculate(&self, path: &Utf8Path) -> Result<String>;
}

/// Calculates a checksum for a file using a dynamic checksum algorithm.
///
/// # Arguments
///
/// * `path` - The path to the file.
/// * `algorithm` - A trait object that implements `ChecksumAlgorithm`.
///
/// # Example
///
/// ```no_run
/// use file_ops::{checksum, Sha256};
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("file.txt");
/// let sha256_checksum = checksum(path, &Sha256).unwrap();
/// ```
pub fn checksum(path: &Utf8Path, algorithm: &dyn ChecksumAlgorithm) -> Result<String> {
    algorithm.calculate(path)
}

/// SHA-256 checksum algorithm.
pub struct Sha256;

impl ChecksumAlgorithm for Sha256 {
    fn calculate(&self, path: &Utf8Path) -> Result<String> {
        let mut file = File::open(path)?;
        let mut hasher = Sha256Hasher::new();
        std::io::copy(&mut file, &mut hasher)?;

        Ok(format!("{:x}", hasher.finalize()))
    }
}

/// BLAKE3 checksum algorithm.
pub struct Blake3;

impl ChecksumAlgorithm for Blake3 {
    fn calculate(&self, path: &Utf8Path) -> Result<String> {
        let mut hasher = blake3::Hasher::new();
        let mut file = File::open(path)?;
        std::io::copy(&mut file, &mut hasher)?;
        Ok(hasher.finalize().to_hex().to_string())
    }
}

/// A convenience function to calculate the SHA-256 checksum of a file.
pub fn sha256(path: &Utf8Path) -> Result<String> {
    checksum(path, &Sha256)
}

/// A convenience function to calculate the BLAKE3 checksum of a file.
pub fn blake3(path: &Utf8Path) -> Result<String> {
    checksum(path, &Blake3)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_sha256_checksum() -> Result<()> {
        let dir = tempdir()?;
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        std::fs::write(&path, "hello world")?;

        let checksum = checksum(&path, &Sha256)?;
        assert_eq!(checksum, "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
        Ok(())
    }

    #[test]
    fn test_blake3_checksum() -> Result<()> {
        let dir = tempdir()?;
        let path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        std::fs::write(&path, "hello world")?;

        let checksum = checksum(&path, &Blake3)?;
        assert_eq!(checksum, "d734035e1b37d56e39e2035f21734056342851a665a58354c9d5fb59564d95a2");
        Ok(())
    }
}
