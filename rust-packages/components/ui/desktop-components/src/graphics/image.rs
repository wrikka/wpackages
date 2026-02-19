//! Image rendering capabilities
//! 
//! Provides support for rendering various image formats including GIF and SVG

use image::{DynamicImage, ImageFormat};
use std::io::Cursor;
use anyhow::Result;

/// Image data with format support
#[derive(Debug, Clone)]
pub struct RsuiImage {
    pub data: DynamicImage,
    pub format: ImageFormat,
}

impl RsuiImage {
    /// Load image from bytes
    pub fn from_bytes(bytes: &[u8]) -> Result<Self> {
        let data = image::load_from_memory(bytes)?;
        let format = image::guess_format(bytes)?;
        
        Ok(Self { data, format })
    }

    /// Load image from file path
    pub fn from_file(path: &str) -> Result<Self> {
        let data = image::open(path)?;
        let format = ImageFormat::from_path(path)
            .ok_or_else(|| anyhow::anyhow!("Unknown image format"))?;
        
        Ok(Self { data, format })
    }

    /// Get image dimensions
    pub fn dimensions(&self) -> (u32, u32) {
        self.data.dimensions()
    }

    /// Resize image
    pub fn resize(&mut self, width: u32, height: u32) {
        self.data = self.data.resize(width, height, image::imageops::FilterType::Lanczos3);
    }

    /// Convert to RGBA bytes
    pub fn to_rgba_bytes(&self) -> Vec<u8> {
        self.data.to_rgba8().into_raw()
    }

    /// Check if animated GIF
    pub fn is_animated(&self) -> bool {
        self.format == ImageFormat::Gif
    }
}

/// Image cache for performance
pub struct ImageCache {
    cache: std::collections::HashMap<String, RsuiImage>,
}

impl ImageCache {
    /// Create new image cache
    pub fn new() -> Self {
        Self {
            cache: std::collections::HashMap::new(),
        }
    }

    /// Get image from cache
    pub fn get(&self, key: &str) -> Option<&RsuiImage> {
        self.cache.get(key)
    }

    /// Insert image into cache
    pub fn insert(&mut self, key: String, image: RsuiImage) {
        self.cache.insert(key, image);
    }

    /// Load and cache image
    pub fn load(&mut self, key: String, path: &str) -> Result<&RsuiImage> {
        if !self.cache.contains_key(&key) {
            let image = RsuiImage::from_file(path)?;
            self.cache.insert(key.clone(), image);
        }
        Ok(self.cache.get(&key.as_str()).unwrap())
    }
}

impl Default for ImageCache {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_image_cache() {
        let mut cache = ImageCache::new();
        assert!(cache.get("test").is_none());
    }
}
