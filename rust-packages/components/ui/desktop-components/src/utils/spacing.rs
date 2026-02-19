/// Spacing scale following 4px base unit system
/// Common spacing values in pixels
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Spacing {
    /// 0px
    None = 0,
    /// 4px
    Xs = 4,
    /// 8px
    Sm = 8,
    /// 12px
    Md = 12,
    /// 16px
    Lg = 16,
    /// 20px
    Xl = 20,
    /// 24px
    Xl2 = 24,
    /// 32px
    Xl3 = 32,
    /// 40px
    Xl4 = 40,
    /// 48px
    Xl5 = 48,
    /// 64px
    Xl6 = 64,
    /// 80px
    Xl7 = 80,
    /// 96px
    Xl8 = 96,
}

impl Spacing {
    /// Get spacing value in pixels
    pub fn to_pixels(self) -> f32 {
        (self as i32) as f32
    }

    /// Get spacing value as egui Vec2
    pub fn to_vec2(self) -> eframe::egui::Vec2 {
        eframe::egui::vec2(self.to_pixels(), self.to_pixels())
    }

    /// Get spacing value as egui Vec2 with custom width
    pub fn to_vec2_width(self, width: f32) -> eframe::egui::Vec2 {
        eframe::egui::vec2(width, self.to_pixels())
    }

    /// Get spacing value as egui Vec2 with custom height
    pub fn to_vec2_height(self, height: f32) -> eframe::egui::Vec2 {
        eframe::egui::vec2(self.to_pixels(), height)
    }
}

impl Default for Spacing {
    fn default() -> Self {
        Spacing::Md
    }
}

/// Border radius scale
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Radius {
    /// 0px
    None = 0,
    /// 2px
    Xs = 2,
    /// 4px
    Sm = 4,
    /// 6px
    Md = 6,
    /// 8px
    Lg = 8,
    /// 12px
    Xl = 12,
    /// 16px
    Xl2 = 16,
    /// 24px
    Xl3 = 24,
    /// 9999px (full)
    Full = 9999,
}

impl Radius {
    /// Get radius value in pixels
    pub fn to_pixels(self) -> f32 {
        (self as i32) as f32
    }
}

impl Default for Radius {
    fn default() -> Self {
        Radius::Lg
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_spacing_to_pixels() {
        assert_eq!(Spacing::Xs.to_pixels(), 4.0);
        assert_eq!(Spacing::Md.to_pixels(), 12.0);
        assert_eq!(Spacing::Lg.to_pixels(), 16.0);
    }

    #[test]
    fn test_spacing_to_vec2() {
        let vec = Spacing::Lg.to_vec2();
        assert_eq!(vec.x, 16.0);
        assert_eq!(vec.y, 16.0);
    }

    #[test]
    fn test_radius_to_pixels() {
        assert_eq!(Radius::Xs.to_pixels(), 2.0);
        assert_eq!(Radius::Lg.to_pixels(), 8.0);
    }
}
