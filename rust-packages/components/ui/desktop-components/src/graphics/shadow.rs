//! Shadow effects for UI elements
//! 
//! Provides various shadow styles and blur effects

/// Shadow configuration
#[derive(Debug, Clone, Copy)]
pub struct ShadowConfig {
    /// Horizontal offset
    pub offset_x: f32,
    /// Vertical offset
    pub offset_y: f32,
    /// Blur radius
    pub blur_radius: f32,
    /// Spread radius
    pub spread_radius: f32,
    /// Shadow color (RGBA)
    pub color: [f32; 4],
}

impl ShadowConfig {
    /// Create a new shadow config
    pub fn new(offset_x: f32, offset_y: f32, blur_radius: f32, color: [f32; 4]) -> Self {
        Self {
            offset_x,
            offset_y,
            blur_radius,
            spread_radius: 0.0,
            color,
        }
    }

    /// Small shadow
    pub fn small() -> Self {
        Self {
            offset_x: 0.0,
            offset_y: 1.0,
            blur_radius: 2.0,
            spread_radius: 0.0,
            color: [0.0, 0.0, 0.0, 0.14],
        }
    }

    /// Medium shadow
    pub fn medium() -> Self {
        Self {
            offset_x: 0.0,
            offset_y: 4.0,
            blur_radius: 6.0,
            spread_radius: -1.0,
            color: [0.0, 0.0, 0.0, 0.1],
        }
    }

    /// Large shadow
    pub fn large() -> Self {
        Self {
            offset_x: 0.0,
            offset_y: 10.0,
            blur_radius: 15.0,
            spread_radius: -3.0,
            color: [0.0, 0.0, 0.0, 0.1],
        }
    }

    /// No shadow
    pub fn none() -> Self {
        Self {
            offset_x: 0.0,
            offset_y: 0.0,
            blur_radius: 0.0,
            spread_radius: 0.0,
            color: [0.0, 0.0, 0.0, 0.0],
        }
    }
}

impl Default for ShadowConfig {
    fn default() -> Self {
        Self::medium()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shadow_presets() {
        let small = ShadowConfig::small();
        assert_eq!(small.blur_radius, 2.0);
        
        let medium = ShadowConfig::medium();
        assert_eq!(medium.blur_radius, 6.0);
    }
}
