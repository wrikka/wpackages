use async_compression::tokio::bufread::{GzipEncoder, BrotliEncoder, ZstdEncoder};
use std::io::Read;
use tracing::debug;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompressionType {
    Gzip,
    Brotli,
    Zstd,
    None,
}

#[derive(Debug, Clone)]
pub struct CompressionConfig {
    pub compression_type: CompressionType,
    pub compression_level: u32,
    pub adaptive: bool,
}

impl Default for CompressionConfig {
    fn default() -> Self {
        Self {
            compression_type: CompressionType::None,
            compression_level: 6,
            adaptive: true,
        }
    }
}

pub struct CompressionLayer {
    config: CompressionConfig,
}

impl CompressionLayer {
    pub fn new(config: CompressionConfig) -> Self {
        Self { config }
    }

    pub async fn compress(&self, data: Vec<u8>) -> Result<Vec<u8>, String> {
        debug!("Compressing data with {:?}", self.config.compression_type);

        match self.config.compression_type {
            CompressionType::Gzip => {
                let reader = std::io::Cursor::new(data);
                let mut encoder = GzipEncoder::new(reader);
                let mut compressed = Vec::new();
                encoder.read_to_end(&mut compressed).map_err(|e| e.to_string())?;
                Ok(compressed)
            }
            CompressionType::Brotli => {
                let reader = std::io::Cursor::new(data);
                let mut encoder = BrotliEncoder::new(reader);
                let mut compressed = Vec::new();
                encoder.read_to_end(&mut compressed).map_err(|e| e.to_string())?;
                Ok(compressed)
            }
            CompressionType::Zstd => {
                let reader = std::io::Cursor::new(data);
                let mut encoder = ZstdEncoder::new(reader);
                let mut compressed = Vec::new();
                encoder.read_to_end(&mut compressed).map_err(|e| e.to_string())?;
                Ok(compressed)
            }
            CompressionType::None => Ok(data),
        }
    }

    pub async fn decompress(&self, data: Vec<u8>) -> Result<Vec<u8>, String> {
        debug!("Decompressing data");

        Ok(data)
    }

    pub fn should_compress(&self, data: &[u8]) -> bool {
        if self.config.adaptive {
            data.len() > 1024
        } else {
            self.config.compression_type != CompressionType::None
        }
    }
}
