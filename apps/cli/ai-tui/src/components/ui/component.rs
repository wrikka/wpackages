//! Common traits and utilities for UI components

use crate::components::ui::Theme;
use ratatui::{layout::Rect, Frame};

/// Trait for UI components that can be themed
pub trait Themed {
    /// Set the theme for this component
    fn set_theme(&mut self, theme: Theme);
}

/// Trait for UI components that can be rendered
pub trait Renderable {
    /// Render the component to the frame
    fn render(&mut self, frame: &mut Frame, area: Rect);
}

/// Trait for UI components with selection state
pub trait Selectable {
    /// Select the next item
    fn select_next(&mut self);

    /// Select the previous item
    fn select_previous(&mut self);
}

/// Trait for UI components with visibility state
pub trait Toggleable {
    /// Show the component
    fn show(&mut self);

    /// Hide the component
    fn hide(&mut self);

    /// Check if the component is visible
    fn is_visible(&self) -> bool;
}

/// Trait for scrollable components
pub trait Scrollable {
    /// Scroll down
    fn scroll_down(&mut self);

    /// Scroll up
    fn scroll_up(&mut self);

    /// Scroll to top
    fn scroll_to_top(&mut self);

    /// Scroll to bottom
    fn scroll_to_bottom(&mut self);
}
