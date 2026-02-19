//! Helper functions for file upload component

use eframe::egui::Color32;

/// Lighten a color by a factor
///
/// # Arguments
/// * `color` - The color to lighten
/// * `factor` - The lightness factor (0.0 to 1.0)
///
/// # Returns
/// * Lightened color
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lighten() {
        let color = Color32::BLACK;
        let lightened = lighten(color, 0.5);
        
        // Lightened black should not be pure black
        assert_ne!(lightened, Color32::BLACK);
        
        // Lightened by 0.0 should be same color
        assert_eq!(lighten(color, 0.0), color);
    }

    #[test]
    fn test_lighten_white() {
        let color = Color32::WHITE;
        let lightened = lighten(color, 0.5);
        
        // Lightened white should still be white
        assert_eq!(lightened, Color32::WHITE);
    }

    #[test]
    fn test_lighten_clamp() {
        let color = Color32::BLACK;
        
        // Factor should be clamped to 0.0-1.0
        assert_eq!(lighten(color, -0.5), lighten(color, 0.0));
        assert_eq!(lighten(color, 2.0), lighten(color, 1.0));
    }
}
