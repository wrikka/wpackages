//! Visual effects for UI elements
//! 
//! Provides blur, glow, and other visual effects

/// Effect types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EffectType {
    None,
    Blur,
    Glow,
    Grayscale,
    Invert,
    Sepia,
}

/// Effect configuration
#[derive(Debug, Clone, Copy)]
pub struct EffectConfig {
    pub effect_type: EffectType,
    pub intensity: f32,
}

impl EffectConfig {
    /// Create a new effect config
    pub fn new(effect_type: EffectType, intensity: f32) -> Self {
        Self {
            effect_type,
            intensity,
        }
    }

    /// Blur effect
    pub fn blur(intensity: f32) -> Self {
        Self {
            effect_type: EffectType::Blur,
            intensity: intensity.clamp(0.0, 20.0),
        }
    }

    /// Glow effect
    pub fn glow(intensity: f32) -> Self {
        Self {
            effect_type: EffectType::Glow,
            intensity: intensity.clamp(0.0, 1.0),
        }
    }

    /// Grayscale effect
    pub fn grayscale(intensity: f32) -> Self {
        Self {
            effect_type: EffectType::Grayscale,
            intensity: intensity.clamp(0.0, 1.0),
        }
    }

    /// Sepia effect
    pub fn sepia(intensity: f32) -> Self {
        Self {
            effect_type: EffectType::Sepia,
            intensity: intensity.clamp(0.0, 1.0),
        }
    }

    /// No effect
    pub fn none() -> Self {
        Self {
            effect_type: EffectType::None,
            intensity: 0.0,
        }
    }
}

impl Default for EffectConfig {
    fn default() -> Self {
        Self::none()
    }
}

/// Compose multiple effects
pub fn compose_effects(effects: &[EffectConfig]) -> EffectConfig {
    if effects.is_empty() {
        return EffectConfig::none();
    }
    
    // Return first effect for simplicity
    effects[0]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_effects() {
        let blur = EffectConfig::blur(5.0);
        assert_eq!(blur.effect_type, EffectType::Blur);
        
        let glow = EffectConfig::glow(0.5);
        assert_eq!(glow.effect_type, EffectType::Glow);
    }
}
