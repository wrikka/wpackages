//! TUI Layout management with resizable and togglable panels
//!
//! The Layout module manages panel sizing and positioning:
//!
//! - Configurable panel widths (explorer, chat, output)
//! - Panel visibility toggling
//! - Responsive layout updates
//! - Panel resizing with constraints
//!
//! # Example
//!
//! ```rust
//! use crate::components::tui::layout::{Layout, LayoutConfig};
//! use ratatui::layout::Rect;
//!
//! let area = Rect::new(0, 0, 100, 50);
//! let layout = Layout::new(area);
//! println!("Chat area: {:?}", layout.chat_area);
//! ```

use crate::components::tui::focus::{FocusPanel, PanelVisibility};
use ratatui::layout::{Constraint, Direction, Layout as RatatuiLayout, Rect};

/// Layout configuration for panels
#[derive(Debug, Clone, Copy)]
pub struct LayoutConfig {
    /// Percentage width for file explorer (0-100)
    pub explorer_width: u16,
    /// Percentage width for chat panel (0-100)
    pub chat_width: u16,
    /// Percentage width for output display (0-100)
    pub output_width: u16,
}

impl Default for LayoutConfig {
    fn default() -> Self {
        Self {
            explorer_width: 25,
            chat_width: 50,
            output_width: 25,
        }
    }
}

impl LayoutConfig {
    /// Create new layout config
    pub fn new() -> Self {
        Self::default()
    }

    /// Resize a panel by percentage
    pub fn resize_panel(&mut self, panel: FocusPanel, delta: i16) {
        let min_width = 10;
        let max_width = 80;

        match panel {
            FocusPanel::FileExplorer => {
                let new_width = (self.explorer_width as i16 + delta).clamp(min_width, max_width);
                self.explorer_width = new_width as u16;
            }
            FocusPanel::ChatPanel => {
                let new_width = (self.chat_width as i16 + delta).clamp(min_width, max_width);
                self.chat_width = new_width as u16;
            }
            FocusPanel::OutputDisplay => {
                let new_width = (self.output_width as i16 + delta).clamp(min_width, max_width);
                self.output_width = new_width as u16;
            }
            _ => {}
        }

        // Normalize to ensure total is 100
        self.normalize();
    }

    /// Normalize widths to ensure they sum to 100
    fn normalize(&mut self) {
        let total = self.explorer_width + self.chat_width + self.output_width;
        if total != 100 {
            let ratio = 100.0 / total as f32;
            self.explorer_width = (self.explorer_width as f32 * ratio) as u16;
            self.chat_width = (self.chat_width as f32 * ratio) as u16;
            self.output_width = 100 - self.explorer_width - self.chat_width;
        }
    }

    /// Get panel width percentage
    pub fn get_panel_width(&self, panel: FocusPanel) -> u16 {
        match panel {
            FocusPanel::FileExplorer => self.explorer_width,
            FocusPanel::ChatPanel => self.chat_width,
            FocusPanel::OutputDisplay => self.output_width,
            _ => 0,
        }
    }
}

/// Layout areas for the application
#[derive(Debug, Clone)]
pub struct Layout {
    pub chat_area: Rect,
    pub explorer_area: Rect,
    pub input_area: Rect,
    pub output_area: Rect,
    pub status_area: Rect,
    pub config: LayoutConfig,
}

impl Layout {
    /// Create new layout with default config
    pub fn new(area: Rect) -> Self {
        Self::with_config(area, LayoutConfig::default())
    }

    /// Create new layout with custom config
    pub fn with_config(area: Rect, config: LayoutConfig) -> Self {
        let chunks = RatatuiLayout::default()
            .direction(Direction::Vertical)
            .margin(1)
            .constraints([
                Constraint::Min(0),
                Constraint::Length(3),
                Constraint::Length(1),
            ])
            .split(area);

        let main_area = chunks[0];
        let input_area = chunks[1];
        let status_area = chunks[2];

        let main_chunks = RatatuiLayout::default()
            .direction(Direction::Horizontal)
            .constraints([
                Constraint::Percentage(config.explorer_width),
                Constraint::Percentage(config.chat_width),
                Constraint::Percentage(config.output_width),
            ])
            .split(main_area);

        let explorer_area = main_chunks[0];
        let chat_area = main_chunks[1];
        let output_area = main_chunks[2];

        Self {
            chat_area,
            explorer_area,
            input_area,
            output_area,
            status_area,
            config,
        }
    }

    /// Create layout with panel visibility
    pub fn with_visibility(area: Rect, config: LayoutConfig, visibility: &PanelVisibility) -> Self {
        let chunks = RatatuiLayout::default()
            .direction(Direction::Vertical)
            .margin(1)
            .constraints([
                Constraint::Min(0),
                Constraint::Length(3),
                Constraint::Length(1),
            ])
            .split(area);

        let main_area = chunks[0];
        let input_area = chunks[1];
        let status_area = chunks[2];

        // Count visible panels
        let _visible_count = visibility.visible_count();

        // Calculate constraints based on visibility
        let mut constraints = Vec::new();

        if visibility.file_explorer {
            constraints.push(Constraint::Percentage(config.explorer_width));
        }
        if visibility.chat_panel {
            constraints.push(Constraint::Percentage(config.chat_width));
        }
        if visibility.output_display {
            constraints.push(Constraint::Percentage(config.output_width));
        }

        // If no panels visible, use equal distribution
        if constraints.is_empty() {
            constraints = vec![Constraint::Percentage(100)];
        }

        let main_chunks = RatatuiLayout::default()
            .direction(Direction::Horizontal)
            .constraints(constraints.as_slice())
            .split(main_area);

        // Assign areas based on visibility order
        let mut chunk_index = 0;
        let mut explorer_area = Rect::default();
        let mut chat_area = Rect::default();
        let mut output_area = Rect::default();

        if visibility.file_explorer && chunk_index < main_chunks.len() {
            explorer_area = main_chunks[chunk_index];
            chunk_index += 1;
        }
        if visibility.chat_panel && chunk_index < main_chunks.len() {
            chat_area = main_chunks[chunk_index];
            chunk_index += 1;
        }
        if visibility.output_display && chunk_index < main_chunks.len() {
            output_area = main_chunks[chunk_index];
            let _ = chunk_index; // suppress unused warning, kept for future extensibility
        }

        Self {
            chat_area,
            explorer_area,
            input_area,
            output_area,
            status_area,
            config,
        }
    }

    /// Get area for a specific panel
    pub fn get_panel_area(&self, panel: FocusPanel) -> Rect {
        match panel {
            FocusPanel::FileExplorer => self.explorer_area,
            FocusPanel::ChatPanel => self.chat_area,
            FocusPanel::OutputDisplay => self.output_area,
            FocusPanel::InputField => self.input_area,
            FocusPanel::CommandPalette => self.chat_area, // Command palette overlays chat
        }
    }

    /// Resize panel
    pub fn resize_panel(&mut self, panel: FocusPanel, delta: i16, area: Rect) {
        self.config.resize_panel(panel, delta);
        *self = Self::with_config(area, self.config);
    }

    /// Update layout with new terminal size
    pub fn update(&mut self, area: Rect, visibility: Option<&PanelVisibility>) {
        if let Some(vis) = visibility {
            *self = Self::with_visibility(area, self.config, vis);
        } else {
            *self = Self::with_config(area, self.config);
        }
    }

    /// Check if panel is visible (has non-zero area)
    pub fn is_panel_visible(&self, panel: FocusPanel) -> bool {
        let area = self.get_panel_area(panel);
        area.width > 0 && area.height > 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_layout_config_default() {
        let config = LayoutConfig::default();
        assert_eq!(config.explorer_width, 25);
        assert_eq!(config.chat_width, 50);
        assert_eq!(config.output_width, 25);
    }

    #[test]
    fn test_layout_config_resize() {
        let mut config = LayoutConfig::default();
        config.resize_panel(FocusPanel::FileExplorer, 10);
        assert_eq!(config.explorer_width, 35);
    }

    #[test]
    fn test_layout_config_normalize() {
        let mut config = LayoutConfig::default();
        config.explorer_width = 40;
        config.chat_width = 40;
        config.output_width = 40;
        config.normalize();
        assert_eq!(
            config.explorer_width + config.chat_width + config.output_width,
            100
        );
    }

    #[test]
    fn test_layout_config_clamp() {
        let mut config = LayoutConfig::default();
        config.resize_panel(FocusPanel::FileExplorer, 100);
        assert!(config.explorer_width <= 80);
    }
}
