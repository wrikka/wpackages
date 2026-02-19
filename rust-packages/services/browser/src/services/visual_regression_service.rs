use crate::error::Result;
use async_trait::async_trait;
use image::DynamicImage;

#[derive(Debug, Clone)]
pub struct DiffResult {
    pub diff_percentage: f32,
    pub diff_pixels: u64,
    pub total_pixels: u64,
    pub diff_image: Option<Vec<u8>>,
}

impl DiffResult {
    pub fn is_significant(&self, threshold: f32) -> bool {
        self.diff_percentage > threshold
    }
}

#[async_trait]
pub trait VisualRegressionService: Send + Sync {
    async fn capture_baseline(&self, session_id: &str, name: &str) -> Result<String>;
    async fn compare(
        &self,
        session_id: &str,
        baseline_id: &str,
        threshold: f32,
    ) -> Result<DiffResult>;
    async fn get_baseline(&self, id: &str) -> Result<Option<Vec<u8>>>;
    async fn list_baselines(&self, session_id: &str) -> Result<Vec<String>>;
    async fn delete_baseline(&self, id: &str) -> Result<()>;
}

pub fn compare_images(img1: &DynamicImage, img2: &DynamicImage) -> DiffResult {
    let (width1, height1) = (img1.width(), img1.height());
    let (width2, height2) = (img2.width(), img2.height());

    if width1 != width2 || height1 != height2 {
        return DiffResult {
            diff_percentage: 100.0,
            diff_pixels: (width1 * height1).max(width2 * height2) as u64,
            total_pixels: (width1 * height1).max(width2 * height2) as u64,
            diff_image: None,
        };
    }

    let pixels1 = img1.to_rgba8();
    let pixels2 = img2.to_rgba8();
    let total_pixels = (width1 * height1) as u64;
    let mut diff_pixels = 0u64;

    for (_, p1, p2) in pixels1.enumerate_pixels().zip(pixels2.enumerate_pixels()) {
        if p1 != p2 {
            diff_pixels += 1;
        }
    }

    let diff_percentage = if total_pixels > 0 {
        (diff_pixels as f64 / total_pixels as f64 * 100.0) as f32
    } else {
        0.0
    };

    DiffResult {
        diff_percentage,
        diff_pixels,
        total_pixels,
        diff_image: None,
    }
}
