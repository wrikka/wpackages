use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlameHeatmapData {
    pub file_path: String,
    pub lines: Vec<LineBlameInfo>,
    pub author_stats: HashMap<String, AuthorStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineBlameInfo {
    pub line_number: usize,
    pub author: String,
    pub author_email: String,
    pub commit_hash: String,
    pub commit_date: String,
    pub age_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorStats {
    pub name: String,
    pub line_count: usize,
    pub percentage: f32,
    pub avg_age_days: f32,
}

#[derive(Debug, Clone, Default)]
pub struct BlameHeatmapState {
    pub heatmap_data: HashMap<String, BlameHeatmapData>,
    pub view_mode: HeatmapViewMode,
    pub color_scheme: HeatmapColorScheme,
    pub show_authors: bool,
    pub min_age_threshold: u32,
    pub max_age_threshold: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HeatmapViewMode {
    Age,
    Author,
    Both,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HeatmapColorScheme {
    AgeGradient,
    AuthorColor,
    Heatmap,
}

impl BlameHeatmapState {
    pub fn new() -> Self {
        Self {
            heatmap_data: HashMap::new(),
            view_mode: HeatmapViewMode::Age,
            color_scheme: HeatmapColorScheme::AgeGradient,
            show_authors: true,
            min_age_threshold: 0,
            max_age_threshold: 365,
        }
    }

    pub fn compute_heatmap(&mut self, file_path: &str, lines: Vec<LineBlameInfo>) {
        let mut author_stats: HashMap<String, AuthorStats> = HashMap::new();
        let total_lines = lines.len();

        for line in &lines {
            let stats = author_stats.entry(line.author.clone()).or_insert(AuthorStats {
                name: line.author.clone(),
                line_count: 0,
                percentage: 0.0,
                avg_age_days: 0.0,
            });
            stats.line_count += 1;
            stats.avg_age_days = (stats.avg_age_days * (stats.line_count - 1) as f32 + line.age_days as f32) / stats.line_count as f32;
        }

        for stats in author_stats.values_mut() {
            stats.percentage = stats.line_count as f32 / total_lines as f32 * 100.0;
        }

        self.heatmap_data.insert(
            file_path.to_string(),
            BlameHeatmapData {
                file_path: file_path.to_string(),
                lines,
                author_stats,
            },
        );
    }

    pub fn get_heatmap_for_file(&self, file_path: &str) -> Option<&BlameHeatmapData> {
        self.heatmap_data.get(file_path)
    }

    pub fn clear_heatmap(&mut self, file_path: &str) {
        self.heatmap_data.remove(file_path);
    }
}
