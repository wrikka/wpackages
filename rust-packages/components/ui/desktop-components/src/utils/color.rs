use eframe::egui::Color32;

/// Lighten a color by a given factor (0.0 to 1.0)
pub fn lighten(color: Color32, factor: f32) -> Color32 {
    let [r, g, b, a] = color.to_array();
    let factor = factor.clamp(0.0, 1.0);
    
    Color32::from_rgba_premultiplied(
        ((r as f32) + (255.0 - r as f32) * factor) as u8,
        ((g as f32) + (255.0 - g as f32) * factor) as u8,
        ((b as f32) + (255.0 - b as f32) * factor) as u8,
        a,
    )
}

/// Darken a color by a given factor (0.0 to 1.0)
///
/// # Arguments
/// * `color` - The color to darken
/// * `factor` - The factor to darken by (0.0 = no change, 1.0 = black)
///
/// # Examples
/// ```
/// use rsui::utils::color::darken;
/// use eframe::egui::Color32;
///
/// let gray = darken(Color32::WHITE, 0.5);
/// ```
pub fn darken(color: Color32, factor: f32) -> Color32 {
    let [r, g, b, a] = color.to_array();
    let factor = factor.clamp(0.0, 1.0);
    
    Color32::from_rgba_premultiplied(
        ((r as f32) * (1.0 - factor)) as u8,
        ((g as f32) * (1.0 - factor)) as u8,
        ((b as f32) * (1.0 - factor)) as u8,
        a,
    )
}

/// Calculate contrast ratio between two colors (WCAG 2.1)
pub fn contrast_ratio(foreground: Color32, background: Color32) -> f32 {
    let fg_luminance = relative_luminance(foreground);
    let bg_luminance = relative_luminance(background);
    
    let lighter = fg_luminance.max(bg_luminance);
    let darker = fg_luminance.min(bg_luminance);
    
    (lighter + 0.05) / (darker + 0.05)
}

/// Calculate relative luminance of a color (WCAG 2.1)
pub fn relative_luminance(color: Color32) -> f32 {
    let [r, g, b, _] = color.to_array();
    
    let to_linear = |c: u8| {
        let normalized = c as f32 / 255.0;
        if normalized <= 0.03928 {
            normalized / 12.92
        } else {
            ((normalized + 0.055) / 1.055).powf(2.4)
        }
    };
    
    let r_linear = to_linear(r);
    let g_linear = to_linear(g);
    let b_linear = to_linear(b);
    
    0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear
}

/// Check if color contrast meets WCAG AA standard (4.5:1 for normal text)
pub fn meets_wcag_aa(foreground: Color32, background: Color32) -> bool {
    contrast_ratio(foreground, background) >= 4.5
}

/// Check if color contrast meets WCAG AAA standard (7:1 for normal text)
pub fn meets_wcag_aaa(foreground: Color32, background: Color32) -> bool {
    contrast_ratio(foreground, background) >= 7.0
}

/// Blend two colors with a given factor (0.0 to 1.0)
pub fn blend(color1: Color32, color2: Color32, factor: f32) -> Color32 {
    let [r1, g1, b1, a1] = color1.to_array();
    let [r2, g2, b2, a2] = color2.to_array();
    let factor = factor.clamp(0.0, 1.0);
    
    Color32::from_rgba_premultiplied(
        (r1 as f32 + (r2 as f32 - r1 as f32) * factor) as u8,
        (g1 as f32 + (g2 as f32 - g1 as f32) * factor) as u8,
        (b1 as f32 + (b2 as f32 - b1 as f32) * factor) as u8,
        (a1 as f32 + (a2 as f32 - a1 as f32) * factor) as u8,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lighten() {
        let black = Color32::BLACK;
        let gray = lighten(black, 0.5);
        assert_ne!(black, gray);
    }

    #[test]
    fn test_darken() {
        let white = Color32::WHITE;
        let gray = darken(white, 0.5);
        assert_ne!(white, gray);
    }

    #[test]
    fn test_contrast_ratio() {
        let ratio = contrast_ratio(Color32::BLACK, Color32::WHITE);
        assert!(ratio > 1.0);
    }

    #[test]
    fn test_meets_wcag_aa() {
        assert!(meets_wcag_aa(Color32::BLACK, Color32::WHITE));
    }

    #[test]
    fn test_blend() {
        let black = Color32::BLACK;
        let white = Color32::WHITE;
        let gray = blend(black, white, 0.5);
        assert_ne!(black, gray);
        assert_ne!(white, gray);
    }
}
