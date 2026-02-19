//! Easing functions for smooth animations
//! 
//! Provides various easing functions for different animation curves

/// Easing function type
pub type EasingFn = fn(f32) -> f32;

/// Linear easing
pub fn linear(t: f32) -> f32 {
    t
}

/// Ease in quad
pub fn ease_in_quad(t: f32) -> f32 {
    t * t
}

/// Ease out quad
pub fn ease_out_quad(t: f32) -> f32 {
    t * (2.0 - t)
}

/// Ease in out quad
pub fn ease_in_out_quad(t: f32) -> f32 {
    if t < 0.5 {
        2.0 * t * t
    } else {
        -1.0 + (4.0 - 2.0 * t) * t
    }
}

/// Ease in cubic
pub fn ease_in_cubic(t: f32) -> f32 {
    t * t * t
}

/// Ease out cubic
pub fn ease_out_cubic(t: f32) -> f32 {
    let f = t - 1.0;
    f * f * f + 1.0
}

/// Ease in out cubic
pub fn ease_in_out_cubic(t: f32) -> f32 {
    if t < 0.5 {
        4.0 * t * t * t
    } else {
        let f = t - 1.0;
        1.0 + f * f * f * 4.0
    }
}

/// Ease in quart
pub fn ease_in_quart(t: f32) -> f32 {
    t * t * t * t
}

/// Ease out quart
pub fn ease_out_quart(t: f32) -> f32 {
    let f = t - 1.0;
    1.0 - f * f * f * f
}

/// Ease in out quart
pub fn ease_in_out_quart(t: f32) -> f32 {
    if t < 0.5 {
        8.0 * t * t * t * t
    } else {
        let f = t - 1.0;
        1.0 - 8.0 * f * f * f * f
    }
}

/// Ease in quint
pub fn ease_in_quint(t: f32) -> f32 {
    t * t * t * t * t
}

/// Ease out quint
pub fn ease_out_quint(t: f32) -> f32 {
    let f = t - 1.0;
    1.0 + f * f * f * f * f
}

/// Ease in out quint
pub fn ease_in_out_quint(t: f32) -> f32 {
    if t < 0.5 {
        16.0 * t * t * t * t * t
    } else {
        let f = t * 2.0 - 2.0;
        1.0 + f * f * f * f * f * 16.0
    }
}

/// Ease in expo
pub fn ease_in_expo(t: f32) -> f32 {
    if t == 0.0 {
        0.0
    } else {
        2.0_f32.powf(10.0 * (t - 1.0))
    }
}

/// Ease out expo
pub fn ease_out_expo(t: f32) -> f32 {
    if t == 1.0 {
        1.0
    } else {
        1.0 - 2.0_f32.powf(-10.0 * t)
    }
}

/// Ease in out expo
pub fn ease_in_out_expo(t: f32) -> f32 {
    if t == 0.0 || t == 1.0 {
        t
    } else if t < 0.5 {
        2.0_f32.powf(20.0 * t - 10.0) / 2.0
    } else {
        (2.0 - 2.0_f32.powf(-20.0 * t + 10.0)) / 2.0
    }
}

/// Ease in circ
pub fn ease_in_circ(t: f32) -> f32 {
    1.0 - (1.0 - t * t).sqrt()
}

/// Ease out circ
pub fn ease_out_circ(t: f32) -> f32 {
    let f = t - 1.0;
    (1.0 - f * f).sqrt()
}

/// Ease in out circ
pub fn ease_in_out_circ(t: f32) -> f32 {
    if t < 0.5 {
        (1.0 - (1.0 - 2.0 * t).powi(2).sqrt()) / 2.0
    } else {
        ((1.0 - (-2.0 * t + 2.0).powi(2).sqrt()) + 1.0) / 2.0
    }
}

/// Ease in back
pub fn ease_in_back(t: f32) -> f32 {
    let c1 = 1.70158;
    let c3 = c1 + 1.0;
    c3 * t * t * t - c1 * t * t
}

/// Ease out back
pub fn ease_out_back(t: f32) -> f32 {
    let c1 = 1.70158;
    let c3 = c1 + 1.0;
    1.0 + c3 * (t - 1.0).powi(3) + c1 * (t - 1.0).powi(2)
}

/// Ease in out back
pub fn ease_in_out_back(t: f32) -> f32 {
    let c1 = 1.70158;
    let c2 = c1 * 1.525;
    
    if t < 0.5 {
        ((2.0 * t).powi(2) * ((c2 + 1.0) * 2.0 * t - c2)) / 2.0
    } else {
        ((2.0 * t - 2.0).powi(2) * ((c2 + 1.0) * (t * 2.0 - 2.0) + c2) + 2.0) / 2.0
    }
}

/// Ease out bounce
pub fn ease_out_bounce(t: f32) -> f32 {
    const N1: f32 = 7.5625;
    const D1: f32 = 2.75;
    
    if t < 1.0 / D1 {
        N1 * t * t
    } else if t < 2.0 / D1 {
        let t = t - 1.5 / D1;
        N1 * t * t + 0.75
    } else if t < 2.5 / D1 {
        let t = t - 2.25 / D1;
        N1 * t * t + 0.9375
    } else {
        let t = t - 2.625 / D1;
        N1 * t * t + 0.984375
    }
}

/// Ease in bounce
pub fn ease_in_bounce(t: f32) -> f32 {
    1.0 - ease_out_bounce(1.0 - t)
}

/// Ease in out bounce
pub fn ease_in_out_bounce(t: f32) -> f32 {
    if t < 0.5 {
        (1.0 - ease_out_bounce(1.0 - 2.0 * t)) / 2.0
    } else {
        (1.0 + ease_out_bounce(2.0 * t - 1.0)) / 2.0
    }
}

/// Easing function variants
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Easing {
    Linear,
    EaseInQuad,
    EaseOutQuad,
    EaseInOutQuad,
    EaseInCubic,
    EaseOutCubic,
    EaseInOutCubic,
    EaseInQuart,
    EaseOutQuart,
    EaseInOutQuart,
    EaseInQuint,
    EaseOutQuint,
    EaseInOutQuint,
    EaseInExpo,
    EaseOutExpo,
    EaseInOutExpo,
    EaseInCirc,
    EaseOutCirc,
    EaseInOutCirc,
    EaseInBack,
    EaseOutBack,
    EaseInOutBack,
    EaseInBounce,
    EaseOutBounce,
    EaseInOutBounce,
}

impl Easing {
    /// Get the easing function
    pub fn function(self) -> EasingFn {
        match self {
            Easing::Linear => linear,
            Easing::EaseInQuad => ease_in_quad,
            Easing::EaseOutQuad => ease_out_quad,
            Easing::EaseInOutQuad => ease_in_out_quad,
            Easing::EaseInCubic => ease_in_cubic,
            Easing::EaseOutCubic => ease_out_cubic,
            Easing::EaseInOutCubic => ease_in_out_cubic,
            Easing::EaseInQuart => ease_in_quart,
            Easing::EaseOutQuart => ease_out_quart,
            Easing::EaseInOutQuart => ease_in_out_quart,
            Easing::EaseInQuint => ease_in_quint,
            Easing::EaseOutQuint => ease_out_quint,
            Easing::EaseInOutQuint => ease_in_out_quint,
            Easing::EaseInExpo => ease_in_expo,
            Easing::EaseOutExpo => ease_out_expo,
            Easing::EaseInOutExpo => ease_in_out_expo,
            Easing::EaseInCirc => ease_in_circ,
            Easing::EaseOutCirc => ease_out_circ,
            Easing::EaseInOutCirc => ease_in_out_circ,
            Easing::EaseInBack => ease_in_back,
            Easing::EaseOutBack => ease_out_back,
            Easing::EaseInOutBack => ease_in_out_back,
            Easing::EaseInBounce => ease_in_bounce,
            Easing::EaseOutBounce => ease_out_bounce,
            Easing::EaseInOutBounce => ease_in_out_bounce,
        }
    }
}

impl Default for Easing {
    fn default() -> Self {
        Easing::EaseInOutCubic
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_easing_functions() {
        assert_eq!(linear(0.0), 0.0);
        assert_eq!(linear(1.0), 1.0);
        
        assert_eq!(ease_in_quad(0.5), 0.25);
        assert_eq!(ease_out_quad(0.5), 0.75);
    }

    #[test]
    fn test_easing_enum() {
        let easing = Easing::EaseInOutCubic;
        let func = easing.function();
        assert_eq!(func(0.0), 0.0);
        assert_eq!(func(1.0), 1.0);
    }
}
