//! # Git Graph Visualization Types
//!
//! Types for the Interactive Git Graph Visualization feature including
//! 3D/2D visualization, filters, and animations.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Git graph view mode (2D or 3D)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GraphViewMode {
    TwoD,
    ThreeD,
}

/// Git graph visualization state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitGraph {
    pub commits: Vec<CommitNode>,
    pub branches: Vec<Branch>,
    pub tags: Vec<Tag>,
    pub view_mode: GraphViewMode,
    pub filters: GraphFilters,
    pub animation: GraphAnimation,
    pub layout: GraphLayout,
}

/// Commit node in the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitNode {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub parents: Vec<String>,
    pub branch: Option<String>,
    pub position: NodePosition,
    pub metadata: CommitMetadata,
}

/// Position of a node in the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodePosition {
    pub x: f64,
    pub y: f64,
    pub z: Option<f64>, // Only for 3D mode
}

/// Additional metadata for commits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitMetadata {
    pub is_merge: bool,
    pub is_head: bool,
    pub has_conflicts: bool,
    pub file_count: u32,
    pub line_changes: LineChanges,
}

/// Line changes statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineChanges {
    pub additions: u32,
    pub deletions: u32,
}

/// Branch in the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Branch {
    pub name: String,
    pub head_commit: String,
    pub is_remote: bool,
    pub is_current: bool,
    pub color: String,
}

/// Tag in the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub name: String,
    pub commit_hash: String,
    pub annotation: Option<String>,
}

/// Filters for the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphFilters {
    pub author: Option<String>,
    pub time_range: Option<TimeRange>,
    pub file_pattern: Option<String>,
    pub branch: Option<String>,
    pub show_merged: bool,
    pub show_tags: bool,
}

/// Time range filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: chrono::DateTime<chrono::Utc>,
    pub end: chrono::DateTime<chrono::Utc>,
}

/// Animation settings for the graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphAnimation {
    pub enabled: bool,
    pub speed: AnimationSpeed,
    pub style: AnimationStyle,
}

/// Animation speed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimationSpeed {
    Slow,
    Normal,
    Fast,
}

/// Animation style
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimationStyle {
    Fade,
    Slide,
    Expand,
    None,
}

/// Graph layout configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphLayout {
    pub orientation: GraphOrientation,
    pub spacing: LayoutSpacing,
    pub show_labels: bool,
    pub show_dates: bool,
    pub show_authors: bool,
}

/// Graph orientation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GraphOrientation {
    Horizontal,
    Vertical,
}

/// Spacing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutSpacing {
    pub horizontal: f64,
    pub vertical: f64,
}

/// Graph interaction state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphInteraction {
    pub selected_commit: Option<String>,
    pub hovered_commit: Option<String>,
    pub zoom_level: f64,
    pan_offset: PanOffset,
    pub selection_mode: SelectionMode,
}

/// Pan offset
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PanOffset {
    pub x: f64,
    pub y: f64,
}

/// Selection mode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SelectionMode {
    Single,
    Multiple,
    Range,
}

/// Graph highlight configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphHighlight {
    pub highlight_merges: bool,
    pub highlight_conflicts: bool,
    pub highlight_branches: Vec<String>,
    pub custom_highlights: HashMap<String, HighlightStyle>,
}

/// Highlight style for commits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighlightStyle {
    pub color: String,
    pub border_width: f64,
    pub glow: bool,
}
