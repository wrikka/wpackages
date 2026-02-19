//! # Git Graph Component
//!
//! UI component for the Interactive Git Graph Visualization feature.

mod render;
mod drawing;
mod interaction;

use crate::types::git_graph_types::*;
use egui::*;

/// Git graph visualization component
pub struct GitGraphComponent {
    graph: GitGraph,
    interaction: GraphInteraction,
    highlight: GraphHighlight,
    zoom: f64,
    pan: Vec2,
}

impl GitGraphComponent {
    /// Create a new git graph component
    pub fn new() -> Self {
        Self {
            graph: GitGraph {
                commits: vec![],
                branches: vec![],
                tags: vec![],
                view_mode: GraphViewMode::TwoD,
                filters: GraphFilters {
                    author: None,
                    time_range: None,
                    file_pattern: None,
                    branch: None,
                    show_merged: true,
                    show_tags: true,
                },
                animation: GraphAnimation {
                    enabled: false,
                    speed: AnimationSpeed::Normal,
                    style: AnimationStyle::None,
                },
                layout: GraphLayout {
                    orientation: GraphOrientation::Horizontal,
                    spacing: LayoutSpacing {
                        horizontal: 100.0,
                        vertical: 50.0,
                    },
                    show_labels: true,
                    show_dates: true,
                    show_authors: true,
                },
            },
            interaction: GraphInteraction {
                selected_commit: None,
                hovered_commit: None,
                zoom_level: 1.0,
                pan_offset: PanOffset { x: 0.0, y: 0.0 },
                selection_mode: SelectionMode::Single,
            },
            highlight: GraphHighlight {
                highlight_merges: true,
                highlight_conflicts: true,
                highlight_branches: vec![],
                custom_highlights: std::collections::HashMap::new(),
            },
            zoom: 1.0,
            pan: Vec2::ZERO,
        }
    }

    /// Set the graph data
    pub fn set_graph(&mut self, graph: GitGraph) {
        self.graph = graph;
    }
}

impl Default for GitGraphComponent {
    fn default() -> Self {
        Self::new()
    }
}
