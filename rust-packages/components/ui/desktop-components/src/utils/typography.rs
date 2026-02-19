/// Typography scale for consistent font sizing
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FontSize {
    /// 12px
    Xs = 12,
    /// 14px
    Sm = 14,
    /// 16px
    Base = 16,
    /// 18px
    Lg = 18,
    /// 20px
    Xl = 20,
    /// 24px
    Xl2 = 24,
    /// 30px
    Xl3 = 30,
    /// 36px
    Xl4 = 36,
    /// 48px
    Xl5 = 48,
    /// 60px
    Xl6 = 60,
    /// 72px
    Xl7 = 72,
}

impl FontSize {
    /// Get font size in points
    pub fn to_points(self) -> f32 {
        (self as i32) as f32
    }

    /// Get font size in pixels (assuming 1 point = 1.333 pixels)
    pub fn to_pixels(self) -> f32 {
        (self as i32) as f32 * 1.333
    }
}

impl Default for FontSize {
    fn default() -> Self {
        FontSize::Base
    }
}

/// Font weight scale
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FontWeight {
    /// 100
    Thin = 100,
    /// 200
    ExtraLight = 200,
    /// 300
    Light = 300,
    /// 400
    Regular = 400,
    /// 500
    Medium = 500,
    /// 600
    SemiBold = 600,
    /// 700
    Bold = 700,
    /// 800
    ExtraBold = 800,
    /// 900
    Black = 900,
}

impl FontWeight {
    /// Get font weight value
    pub fn to_value(self) -> u16 {
        self as u16
    }
}

impl Default for FontWeight {
    fn default() -> Self {
        FontWeight::Regular
    }
}

/// Line height scale
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LineHeight {
    /// 1.0
    None = 100,
    /// 1.25
    Tight = 125,
    /// 1.5
    Snug = 150,
    /// 1.75
    Normal = 175,
    /// 2.0
    Relaxed = 200,
    /// 2.25
    Loose = 225,
}

impl LineHeight {
    /// Get line height as factor
    pub fn to_factor(self) -> f32 {
        (self as i32) as f32 / 100.0
    }
}

impl Default for LineHeight {
    fn default() -> Self {
        LineHeight::Normal
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_font_size_to_points() {
        assert_eq!(FontSize::Base.to_points(), 16.0);
        assert_eq!(FontSize::Xl.to_points(), 20.0);
    }

    #[test]
    fn test_font_weight_to_value() {
        assert_eq!(FontWeight::Regular.to_value(), 400);
        assert_eq!(FontWeight::Bold.to_value(), 700);
    }

    #[test]
    fn test_line_height_to_factor() {
        assert_eq!(LineHeight::Normal.to_factor(), 1.75);
        assert_eq!(LineHeight::Relaxed.to_factor(), 2.0);
    }
}
