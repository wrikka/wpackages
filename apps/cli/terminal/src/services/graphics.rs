use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use image::{DynamicImage, ImageFormat};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub enum GraphicsProtocol {
    Sixel,
    Kitty,
    ITerm2,
}

#[derive(Debug, Clone)]
pub struct ImageData {
    pub id: String,
    pub image: DynamicImage,
    pub protocol: GraphicsProtocol,
    pub width: u32,
    pub height: u32,
}

pub struct GraphicsDecoder {
    images: Arc<RwLock<HashMap<String, ImageData>>>,
}

impl GraphicsDecoder {
    pub fn new() -> Self {
        Self {
            images: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn decode_sixel(&self, data: &[u8]) -> Result<ImageData> {
        let image = self.parse_sixel(data)?;
        let width = image.width();
        let height = image.height();
        let id = nanoid::nanoid!();

        let image_data = ImageData {
            id: id.clone(),
            image,
            protocol: GraphicsProtocol::Sixel,
            width,
            height,
        };

        self.images.write().insert(id.clone(), image_data.clone());
        Ok(image_data)
    }

    pub fn decode_kitty(&self, data: &[u8]) -> Result<ImageData> {
        let (image, width, height) = self.parse_kitty(data)?;
        let id = nanoid::nanoid!();

        let image_data = ImageData {
            id: id.clone(),
            image,
            protocol: GraphicsProtocol::Kitty,
            width,
            height,
        };

        self.images.write().insert(id.clone(), image_data.clone());
        Ok(image_data)
    }

    pub fn decode_iterm2(&self, data: &[u8]) -> Result<ImageData> {
        let image = self.parse_iterm2(data)?;
        let width = image.width();
        let height = image.height();
        let id = nanoid::nanoid!();

        let image_data = ImageData {
            id: id.clone(),
            image,
            protocol: GraphicsProtocol::ITerm2,
            width,
            height,
        };

        self.images.write().insert(id.clone(), image_data.clone());
        Ok(image_data)
    }

    fn parse_sixel(&self, data: &[u8]) -> Result<DynamicImage> {
        let mut sixel_data = Vec::new();
        let mut in_sixel = false;
        let mut buffer = Vec::new();

        for &byte in data {
            if byte == 0x1B {
                in_sixel = true;
                continue;
            }
            if in_sixel {
                if byte == b'q' {
                    sixel_data.extend_from_slice(&buffer);
                    buffer.clear();
                }
                if byte >= 0x3F && byte <= 0x7E {
                    buffer.push(byte);
                }
                if byte == b'\\' {
                    in_sixel = false;
                }
            }
        }

        let image = image::load_from_memory_with_format(&sixel_data, ImageFormat::Png)
            .context("Failed to parse Sixel image")?;

        Ok(image)
    }

    fn parse_kitty(&self, data: &[u8]) -> Result<(DynamicImage, u32, u32)> {
        let str_data = std::str::from_utf8(data)?;
        let parts: Vec<&str> = str_data.split(';').collect();

        if parts.len() < 3 {
            return Err(anyhow::anyhow!("Invalid Kitty graphics protocol data"));
        }

        let width: u32 = parts[1].parse()?;
        let height: u32 = parts[2].parse()?;

        let base64_start = str_data.find("Gf=").ok_or_else(|| anyhow::anyhow!("No Kitty data"))?;
        let base64_data = &str_data[base64_start + 3..];
        let image_data = BASE64.decode(base64_data)?;

        let image = image::load_from_memory(&image_data)?;

        Ok((image, width, height))
    }

    fn parse_iterm2(&self, data: &[u8]) -> Result<DynamicImage> {
        let str_data = std::str::from_utf8(data)?;
        let base64_start = str_data.find("1337;File=").ok_or_else(|| anyhow::anyhow!("No iTerm2 data"))?;
        let base64_part = &str_data[base64_start + 10..];
        let base64_end = base64_part.find('\x07').ok_or_else(|| anyhow::anyhow!("No iTerm2 end"))?;
        let base64_data = &base64_part[..base64_end];

        let image_data = BASE64.decode(base64_data)?;
        let image = image::load_from_memory(&image_data)?;

        Ok(image)
    }

    pub fn get_image(&self, id: &str) -> Option<ImageData> {
        self.images.read().get(id).cloned()
    }

    pub fn remove_image(&self, id: &str) {
        self.images.write().remove(id);
    }

    pub fn clear_all(&self) {
        self.images.write().clear();
    }
}

impl Default for GraphicsDecoder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sixel_decode() {
        let decoder = GraphicsDecoder::new();
        let sixel_data = b"\x1BPq";
        let result = decoder.decode_sixel(sixel_data);
        assert!(result.is_ok());
    }
}
