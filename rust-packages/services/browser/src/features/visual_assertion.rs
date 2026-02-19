use serde::{Deserialize, Serialize};
use image::{DynamicImage, GenericImageView, Rgba};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualAssertion {
    pub name: String,
    pub baseline_path: String,
    pub current_path: String,
    pub diff_path: Option<String>,
    pub threshold: f64,
    pub passed: bool,
    pub diff_percentage: f64,
    pub regions: Vec<DiffRegion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffRegion {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
    pub pixel_diff_count: usize,
}

#[derive(Debug, Clone)]
pub struct VisualAssertionEngine {
    default_threshold: f64,
    ignore_regions: Vec<(u32, u32, u32, u32)>,
}

impl VisualAssertionEngine {
    pub fn new(default_threshold: f64) -> Self {
        Self {
            default_threshold,
            ignore_regions: Vec::new(),
        }
    }

    pub fn add_ignore_region(&mut self, x: u32, y: u32, width: u32, height: u32) {
        self.ignore_regions.push((x, y, width, height));
    }

    pub async fn compare_screenshots(
        &self,
        name: &str,
        baseline_path: &str,
        current_path: &str,
    ) -> anyhow::Result<VisualAssertion> {
        let baseline = image::open(baseline_path)?;
        let current = image::open(current_path)?;

        let (diff_percentage, regions, diff_image) = self.calculate_diff(&baseline, &current)?;
        
        let passed = diff_percentage <= self.default_threshold;
        
        let diff_path = if !passed {
            let diff_file = format!("{}_diff.png", name);
            diff_image.save(&diff_file)?;
            Some(diff_file)
        } else {
            None
        };

        Ok(VisualAssertion {
            name: name.to_string(),
            baseline_path: baseline_path.to_string(),
            current_path: current_path.to_string(),
            diff_path,
            threshold: self.default_threshold,
            passed,
            diff_percentage,
            regions,
        })
    }

    fn calculate_diff(
        &self,
        baseline: &DynamicImage,
        current: &DynamicImage,
    ) -> anyhow::Result<(f64, Vec<DiffRegion>, DynamicImage)> {
        let (width, height) = baseline.dimensions();
        let mut diff_image = DynamicImage::new_rgba8(width, height);
        
        let mut total_diff_pixels = 0;
        let mut region_map: std::collections::HashMap<(u32, u32), usize> = std::collections::HashMap::new();

        for y in 0..height {
            for x in 0..width {
                if self.is_ignored(x, y) {
                    diff_image.put_pixel(x, y, Rgba([0, 0, 0, 0]));
                    continue;
                }

                let baseline_pixel = baseline.get_pixel(x, y);
                let current_pixel = current.get_pixel(x, y);

                if Self::pixel_diff(&baseline_pixel.0, &current_pixel.0) > 10 {
                    total_diff_pixels += 1;
                    let region_key = (x / 100, y / 100);
                    *region_map.entry(region_key).or_insert(0) += 1;
                    diff_image.put_pixel(x, y, Rgba([255, 0, 0, 255]));
                } else {
                    diff_image.put_pixel(x, y, Rgba([0, 255, 0, 100]));
                }
            }
        }

        let total_pixels = (width * height) as f64;
        let diff_percentage = (total_diff_pixels as f64 / total_pixels) * 100.0;

        let regions: Vec<DiffRegion> = region_map
            .into_iter()
            .map(|((rx, ry), count)| DiffRegion {
                x: rx * 100,
                y: ry * 100,
                width: 100,
                height: 100,
                pixel_diff_count: count,
            })
            .collect();

        Ok((diff_percentage, regions, diff_image))
    }

    fn is_ignored(&self, x: u32, y: u32) -> bool {
        self.ignore_regions.iter().any(|(rx, ry, rw, rh)| {
            x >= *rx && x < rx + rw && y >= *ry && y < ry + rh
        })
    }

    fn pixel_diff(p1: &[u8], p2: &[u8]) -> u32 {
        p1.iter().zip(p2.iter())
            .map(|(a, b)| (*a as i32 - *b as i32).abs() as u32)
            .sum()
    }

    pub fn update_baseline(&self, current_path: &str, baseline_path: &str) -> anyhow::Result<()> {
        std::fs::copy(current_path, baseline_path)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pixel_diff() {
        let p1 = vec![255, 255, 255, 255];
        let p2 = vec![250, 250, 250, 255];
        let diff = VisualAssertionEngine::pixel_diff(&p1, &p2);
        assert_eq!(diff, 15);
    }
}
