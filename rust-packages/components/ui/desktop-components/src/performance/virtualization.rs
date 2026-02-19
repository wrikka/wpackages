//! Virtualization utilities for rendering large datasets efficiently
//! 
//! Provides virtual scrolling and rendering to only render visible items

use std::collections::VecDeque;

/// Configuration for virtual scrolling
#[derive(Debug, Clone, Copy)]
pub struct VirtualizationConfig {
    /// Number of items to render above and below visible area
    pub buffer_size: usize,
    /// Estimated height of each item
    pub item_height: f32,
    /// Total number of items
    pub total_items: usize,
}

impl Default for VirtualizationConfig {
    fn default() -> Self {
        Self {
            buffer_size: 5,
            item_height: 50.0,
            total_items: 0,
        }
    }
}

/// State for virtual scrolling
#[derive(Debug, Clone)]
pub struct VirtualizationState {
    /// First visible index
    pub start_index: usize,
    /// Last visible index
    pub end_index: usize,
    /// Scroll offset
    pub scroll_offset: f32,
    /// Total height
    pub total_height: f32,
}

impl VirtualizationState {
    /// Calculate visible range based on scroll position
    pub fn from_scroll(scroll_offset: f32, config: &VirtualizationConfig) -> Self {
        let start_index = (scroll_offset / config.item_height).floor() as usize;
        let start_index = start_index.saturating_sub(config.buffer_size);
        
        let visible_count = (config.total_height / config.item_height).ceil() as usize;
        let end_index = (start_index + visible_count + config.buffer_size * 2)
            .min(config.total_items);
        
        Self {
            start_index,
            end_index,
            scroll_offset,
            total_height: config.total_items as f32 * config.item_height,
        }
    }
}

/// Virtual list for efficient rendering of large datasets
pub struct VirtualList<T> {
    items: Vec<T>,
    config: VirtualizationConfig,
    state: VirtualizationState,
}

impl<T> VirtualList<T> {
    /// Create a new virtual list
    pub fn new(items: Vec<T>, config: VirtualizationConfig) -> Self {
        let total_items = items.len();
        let config = VirtualizationConfig {
            total_items,
            ..config
        };
        
        Self {
            items,
            config,
            state: VirtualizationState::from_scroll(0.0, &config),
        }
    }

    /// Get visible items
    pub fn visible_items(&self) -> &[T] {
        &self.items[self.state.start_index..self.state.end_index]
    }

    /// Get offset for first visible item
    pub fn start_offset(&self) -> f32 {
        self.state.start_index as f32 * self.config.item_height
    }

    /// Update scroll position
    pub fn set_scroll(&mut self, scroll_offset: f32) {
        self.state = VirtualizationState::from_scroll(scroll_offset, &self.config);
    }

    /// Get total height
    pub fn total_height(&self) -> f32 {
        self.state.total_height
    }

    /// Get current state
    pub fn state(&self) -> &VirtualizationState {
        &self.state
    }
}

/// Virtual grid for 2D layouts
pub struct VirtualGrid<T> {
    items: Vec<T>,
    config: VirtualizationConfig,
    columns: usize,
    state: VirtualizationState,
}

impl<T> VirtualGrid<T> {
    /// Create a new virtual grid
    pub fn new(items: Vec<T>, config: VirtualizationConfig, columns: usize) -> Self {
        let total_items = items.len();
        let config = VirtualizationConfig {
            total_items,
            ..config
        };
        
        Self {
            items,
            config,
            columns,
            state: VirtualizationState::from_scroll(0.0, &config),
        }
    }

    /// Get visible items with their positions
    pub fn visible_items(&self) -> Vec<(usize, &T)> {
        let mut result = Vec::new();
        for i in self.state.start_index..self.state.end_index {
            if i < self.items.len() {
                result.push((i, &self.items[i]));
            }
        }
        result
    }

    /// Update scroll position
    pub fn set_scroll(&mut self, scroll_offset: f32) {
        self.state = VirtualizationState::from_scroll(scroll_offset, &self.config);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_virtual_list() {
        let items: Vec<i32> = (0..1000).collect();
        let config = VirtualizationConfig {
            buffer_size: 5,
            item_height: 50.0,
            total_items: 1000,
        };
        let mut list = VirtualList::new(items, config);
        
        list.set_scroll(250.0); // Scroll to item 5
        assert!(list.visible_items().len() < 1000); // Should only show visible items
    }
}
