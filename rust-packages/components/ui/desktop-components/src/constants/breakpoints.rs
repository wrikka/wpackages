/// Responsive breakpoints in pixels
pub const BREAKPOINT_XS: f32 = 0.0;
pub const BREAKPOINT_SM: f32 = 640.0;
pub const BREAKPOINT_MD: f32 = 768.0;
pub const BREAKPOINT_LG: f32 = 1024.0;
pub const BREAKPOINT_XL: f32 = 1280.0;
pub const BREAKPOINT_XL2: f32 = 1536.0;

/// Screen size categories
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ScreenSize {
    XS,
    SM,
    MD,
    LG,
    XL,
    XL2,
}

impl ScreenSize {
    /// Get screen size from width in pixels
    pub fn from_width(width: f32) -> Self {
        if width < BREAKPOINT_SM {
            ScreenSize::XS
        } else if width < BREAKPOINT_MD {
            ScreenSize::SM
        } else if width < BREAKPOINT_LG {
            ScreenSize::MD
        } else if width < BREAKPOINT_XL {
            ScreenSize::LG
        } else if width < BREAKPOINT_XL2 {
            ScreenSize::XL
        } else {
            ScreenSize::XL2
        }
    }

    /// Get minimum width for this screen size
    pub fn min_width(&self) -> f32 {
        match self {
            ScreenSize::XS => BREAKPOINT_XS,
            ScreenSize::SM => BREAKPOINT_SM,
            ScreenSize::MD => BREAKPOINT_MD,
            ScreenSize::LG => BREAKPOINT_LG,
            ScreenSize::XL => BREAKPOINT_XL,
            ScreenSize::XL2 => BREAKPOINT_XL2,
        }
    }

    /// Check if current width is at least this screen size
    pub fn is_at_least(&self, width: f32) -> bool {
        width >= self.min_width()
    }

    /// Check if current width is smaller than this screen size
    pub fn is_smaller_than(&self, width: f32) -> bool {
        width < self.min_width()
    }
}

impl Default for ScreenSize {
    fn default() -> Self {
        ScreenSize::MD
    }
}
