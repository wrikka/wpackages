use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use image::{DynamicImage, Rgba, GenericImageView};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeatmapData {
    pub elements: Vec<HeatmapElement>,
    pub total_interactions: u64,
    pub time_range: (i64, i64),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeatmapElement {
    pub element_ref: String,
    pub tag_name: String,
    pub bounding_box: BoundingBox,
    pub interaction_count: u64,
    pub interaction_types: HashMap<String, u64>,
    pub intensity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone)]
pub struct ElementHeatmap {
    interactions: Vec<InteractionRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionRecord {
    pub element_ref: String,
    pub interaction_type: InteractionType,
    pub timestamp: i64,
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InteractionType {
    Click,
    Hover,
    Scroll,
    Focus,
    Type,
}

impl ElementHeatmap {
    pub fn new() -> Self {
        Self {
            interactions: Vec::new(),
        }
    }

    pub fn record_interaction(&mut self, record: InteractionRecord) {
        self.interactions.push(record);
    }

    pub fn generate_heatmap(&self, screenshot: &DynamicImage) -> anyhow::Result<DynamicImage> {
        let mut heatmap_image = screenshot.clone();
        let (width, height) = heatmap_image.dimensions();

        let element_data = self.aggregate_interactions();
        let max_count = element_data.values().map(|d| d.1).max().unwrap_or(1) as f64;

        for (element_ref, (bbox, count)) in &element_data {
            let intensity = (*count as f64 / max_count).min(1.0);
            let color = self.intensity_to_color(intensity);

            self.draw_heat_rect(&mut heatmap_image, bbox, color, width, height);
        }

        Ok(heatmap_image)
    }

    fn aggregate_interactions(&self) -> HashMap<String, (BoundingBox, u64)> {
        let mut element_map: HashMap<String, (BoundingBox, u64)> = HashMap::new();

        for record in &self.interactions {
            let bbox = BoundingBox {
                x: record.x,
                y: record.y,
                width: 20.0,
                height: 20.0,
            };

            let entry = element_map.entry(record.element_ref.clone()).or_insert((bbox, 0));
            entry.1 += 1;
        }

        element_map
    }

    fn intensity_to_color(&self, intensity: f64) -> Rgba<u8> {
        let r = (255.0 * intensity) as u8;
        let g = (255.0 * (1.0 - intensity)) as u8;
        let b = 0;
        let a = (128.0 + 127.0 * intensity) as u8;

        Rgba([r, g, b, a])
    }

    fn draw_heat_rect(&self, image: &mut DynamicImage, bbox: &BoundingBox, color: Rgba<u8>, max_width: u32, max_height: u32) {
        let x_start = bbox.x.max(0.0) as u32;
        let y_start = bbox.y.max(0.0) as u32;
        let x_end = ((bbox.x + bbox.width) as u32).min(max_width);
        let y_end = ((bbox.y + bbox.height) as u32).min(max_height);

        for x in x_start..x_end {
            for y in y_start..y_end {
                if x < max_width && y < max_height {
                    image.put_pixel(x, y, color);
                }
            }
        }
    }

    pub fn get_heatmap_data(&self) -> HeatmapData {
        let element_data = self.aggregate_interactions();
        let max_count = element_data.values().map(|d| d.1).max().unwrap_or(1) as f64;

        let mut elements: Vec<HeatmapElement> = self.interactions.iter()
            .fold(HashMap::new(), |mut acc, record| {
                let entry = acc.entry(record.element_ref.clone()).or_insert((
                    BoundingBox { x: record.x, y: record.y, width: 20.0, height: 20.0 },
                    0u64,
                    HashMap::new()
                ));
                entry.1 += 1;
                *entry.2.entry(format!("{:?}", record.interaction_type)).or_insert(0) += 1;
                acc
            })
            .into_iter()
            .map(|(element_ref, (bbox, count, types))| {
                let intensity = count as f64 / max_count;
                HeatmapElement {
                    element_ref,
                    tag_name: "unknown".to_string(),
                    bounding_box: bbox,
                    interaction_count: count,
                    interaction_types: types,
                    intensity,
                }
            })
            .collect();

        elements.sort_by(|a, b| b.interaction_count.cmp(&a.interaction_count));

        let timestamps: Vec<i64> = self.interactions.iter().map(|i| i.timestamp).collect();
        let time_range = if let (Some(&min), Some(&max)) = (timestamps.iter().min(), timestamps.iter().max()) {
            (min, max)
        } else {
            (0, 0)
        };

        HeatmapData {
            elements,
            total_interactions: self.interactions.len() as u64,
            time_range,
        }
    }

    pub fn get_most_interacted_elements(&self, limit: usize) -> Vec<HeatmapElement> {
        let mut data = self.get_heatmap_data().elements;
        data.truncate(limit);
        data
    }

    pub fn clear(&mut self) {
        self.interactions.clear();
    }

    pub fn export_to_json(&self) -> String {
        let data = self.get_heatmap_data();
        serde_json::to_string_pretty(&data).unwrap_or_default()
    }
}
