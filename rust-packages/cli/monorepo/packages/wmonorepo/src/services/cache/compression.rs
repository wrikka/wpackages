use crate::error::AppResult;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use std::io::{Read, Write};

pub fn compress_data(data: &[u8]) -> AppResult<Vec<u8>> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::fast());
    encoder.write_all(data)?;
    Ok(encoder.finish()?)
}

pub fn decompress_data(data: &[u8]) -> AppResult<Vec<u8>> {
    let mut decoder = GzDecoder::new(data);
    let mut buffer = Vec::new();
    decoder.read_to_end(&mut buffer)?;
    Ok(buffer)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compress_decompress() {
        let original = b"Hello, World! This is a test string for compression.";

        let compressed = compress_data(original).unwrap();
        assert!(compressed.len() < original.len());

        let decompressed = decompress_data(&compressed).unwrap();
        assert_eq!(decompressed, original);
    }

    #[test]
    fn test_compress_empty() {
        let original = b"";
        let compressed = compress_data(original).unwrap();
        let decompressed = decompress_data(&compressed).unwrap();
        assert_eq!(decompressed, original);
    }

    #[test]
    fn test_compress_large() {
        let original = vec![0u8; 100_000];
        let compressed = compress_data(&original).unwrap();
        assert!(compressed.len() < original.len());

        let decompressed = decompress_data(&compressed).unwrap();
        assert_eq!(decompressed, original);
    }
}
