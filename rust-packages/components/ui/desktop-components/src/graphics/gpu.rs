//! GPU-accelerated rendering
//! 
//! Provides GPU acceleration for improved performance

use egui_wgpu::WgpuConfiguration;
use wgpu::{InstanceDescriptor, Backends};

/// GPU renderer configuration
#[derive(Debug, Clone)]
pub struct GpuConfig {
    /// Backend preferences
    pub backends: Backends,
    /// Power preference
    pub power_preference: wgpu::PowerPreference,
}

impl Default for GpuConfig {
    fn default() -> Self {
        Self {
            backends: Backends::all(),
            power_preference: wgpu::PowerPreference::HighPerformance,
        }
    }
}

impl GpuConfig {
    /// Create wgpu configuration
    pub fn to_egui_config(&self) -> WgpuConfiguration {
        WgpuConfiguration {
            supported_backends: self.backends,
            device_descriptor: None,
            ..Default::default()
        }
    }
}

/// GPU-accelerated renderer
pub struct GpuRenderer {
    config: GpuConfig,
}

impl GpuRenderer {
    /// Create a new GPU renderer
    pub fn new(config: GpuConfig) -> Self {
        Self { config }
    }

    /// Get configuration
    pub fn config(&self) -> &GpuConfig {
        &self.config
    }

    /// Check if GPU is available
    pub fn is_available() -> bool {
        // Check for GPU availability
        let instance = wgpu::Instance::new(InstanceDescriptor::default());
        instance.enumerate_adapters(self.config.backends).next().is_some()
    }
}

impl Default for GpuRenderer {
    fn default() -> Self {
        Self::new(GpuConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gpu_config() {
        let config = GpuConfig::default();
        let egui_config = config.to_egui_config();
        assert!(egui_config.supported_backends != Backends::empty());
    }
}
