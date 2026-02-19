//! Window management system
//! 
//! Provides multi-window support with positioning, shadows, and resizing

use winit::{
    dpi::{LogicalPosition, LogicalSize, PhysicalPosition, PhysicalSize},
    window::{Window, WindowBuilder, WindowId},
};
use std::collections::HashMap;

/// Window configuration
#[derive(Debug, Clone)]
pub struct WindowConfig {
    pub title: String,
    pub width: f32,
    pub height: f32,
    pub position: Option<(f32, f32)>,
    pub resizable: bool,
    pub decorations: bool,
    pub transparent: bool,
    pub always_on_top: bool,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            title: "Window".to_string(),
            width: 800.0,
            height: 600.0,
            position: None,
            resizable: true,
            decorations: true,
            transparent: false,
            always_on_top: false,
        }
    }
}

/// Window manager for handling multiple windows
pub struct WindowManager {
    windows: HashMap<WindowId, Window>,
    configs: HashMap<WindowId, WindowConfig>,
}

impl WindowManager {
    /// Create a new window manager
    pub fn new() -> Self {
        Self {
            windows: HashMap::new(),
            configs: HashMap::new(),
        }
    }

    /// Create a new window
    pub fn create_window(&mut self, config: WindowConfig) -> Result<WindowId, Box<dyn std::error::Error>> {
        let mut builder = WindowBuilder::new()
            .with_title(&config.title)
            .with_inner_size(LogicalSize::new(config.width, config.height))
            .with_resizable(config.resizable)
            .with_decorations(config.decorations)
            .with_transparent(config.transparent)
            .with_always_on_top(config.always_on_top);

        if let Some((x, y)) = config.position {
            builder = builder.with_position(LogicalPosition::new(x, y));
        }

        let window = builder.build(&winit::event_loop::EventLoop::new().unwrap())?;
        let id = window.id();
        
        self.windows.insert(id, window);
        self.configs.insert(id, config);
        
        Ok(id)
    }

    /// Get window by ID
    pub fn get_window(&self, id: WindowId) -> Option<&Window> {
        self.windows.get(&id)
    }

    /// Get window config
    pub fn get_config(&self, id: WindowId) -> Option<&WindowConfig> {
        self.configs.get(&id)
    }

    /// Close a window
    pub fn close_window(&mut self, id: WindowId) {
        self.windows.remove(&id);
        self.configs.remove(&id);
    }

    /// Get all window IDs
    pub fn window_ids(&self) -> impl Iterator<Item = WindowId> + '_ {
        self.windows.keys().copied()
    }

    /// Set window position
    pub fn set_position(&self, id: WindowId, x: f32, y: f32) -> bool {
        if let Some(window) = self.get_window(id) {
            window.set_outer_position(LogicalPosition::new(x, y));
            true
        } else {
            false
        }
    }

    /// Set window size
    pub fn set_size(&self, id: WindowId, width: f32, height: f32) -> bool {
        if let Some(window) = self.get_window(id) {
            window.set_inner_size(LogicalSize::new(width, height));
            true
        } else {
            false
        }
    }

    /// Center window
    pub fn center_window(&self, id: WindowId) -> bool {
        if let Some(window) = self.get_window(id) {
            if let Some(monitor) = window.current_monitor() {
                let monitor_size = monitor.size();
                let window_size = window.outer_size();
                
                let x = (monitor_size.width - window_size.width) as f32 / 2.0;
                let y = (monitor_size.height - window_size.height) as f32 / 2.0;
                
                window.set_outer_position(LogicalPosition::new(x, y));
                true
            } else {
                false
            }
        } else {
            false
        }
    }
}

impl Default for WindowManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_window_config() {
        let config = WindowConfig::default();
        assert_eq!(config.width, 800.0);
        assert_eq!(config.height, 600.0);
    }
}
