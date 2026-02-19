use eframe::egui::{Color32, Response, Sense, Ui};
use crate::utils::color::{contrast_ratio, meets_wcag_aa, meets_wcag_aaa};

/// Accessibility level for color contrast
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum A11yLevel {
    /// No accessibility requirement
    None,
    /// WCAG AA (4.5:1 for normal text, 3:1 for large text)
    AA,
    /// WCAG AAA (7:1 for normal text, 4.5:1 for large text)
    AAA,
}

impl A11yLevel {
    /// Check if contrast ratio meets this level for normal text
    pub fn meets_normal_text(self, foreground: Color32, background: Color32) -> bool {
        let ratio = contrast_ratio(foreground, background);
        match self {
            A11yLevel::None => true,
            A11yLevel::AA => ratio >= 4.5,
            A11yLevel::AAA => ratio >= 7.0,
        }
    }

    /// Check if contrast ratio meets this level for large text (18pt+ or 14pt+ bold)
    pub fn meets_large_text(self, foreground: Color32, background: Color32) -> bool {
        let ratio = contrast_ratio(foreground, background);
        match self {
            A11yLevel::None => true,
            A11yLevel::AA => ratio >= 3.0,
            A11yLevel::AAA => ratio >= 4.5,
        }
    }
}

impl Default for A11yLevel {
    fn default() -> Self {
        A11yLevel::AA
    }
}

/// Accessibility role for screen readers
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum A11yRole {
    Button,
    Link,
    Input,
    Checkbox,
    Radio,
    Switch,
    Slider,
    Tab,
    Menu,
    MenuItem,
    Dialog,
    Alert,
    Status,
    Navigation,
    Main,
    Complementary,
    ContentInfo,
}

/// Accessibility state for interactive elements
#[derive(Debug, Clone, Default)]
pub struct A11yState {
    pub checked: Option<bool>,
    pub disabled: bool,
    pub expanded: Option<bool>,
    pub selected: Option<bool>,
    pub pressed: Option<bool>,
    pub invalid: bool,
    pub required: bool,
}

impl A11yState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = Some(checked);
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn expanded(mut self, expanded: bool) -> Self {
        self.expanded = Some(expanded);
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = Some(selected);
        self
    }

    pub fn pressed(mut self, pressed: bool) -> Self {
        self.pressed = Some(pressed);
        self
    }

    pub fn invalid(mut self, invalid: bool) -> Self {
        self.invalid = invalid;
        self
    }

    pub fn required(mut self, required: bool) -> Self {
        self.required = required;
        self
    }
}

/// Apply accessibility attributes to a response
pub fn apply_a11y(
    response: &mut Response,
    role: A11yRole,
    state: &A11yState,
    label: Option<&str>,
    description: Option<&str>,
) {
    // Note: egui doesn't have built-in ARIA support yet
    // This is a placeholder for future implementation
    // In the meantime, we can use the response's sense and other properties
    
    // Accessibility info would be stored here for future use
    // when egui adds proper accessibility API support
    let _ = (response, role, state, label, description);
}

/// Accessibility information stored in response
#[derive(Debug, Clone)]
pub struct A11yInfo {
    pub role: A11yRole,
    pub state: A11yState,
    pub label: Option<String>,
    pub description: Option<String>,
}

/// Check if a color combination is accessible
pub fn is_accessible(
    foreground: Color32,
    background: Color32,
    level: A11yLevel,
    is_large_text: bool,
) -> bool {
    if is_large_text {
        level.meets_large_text(foreground, background)
    } else {
        level.meets_normal_text(foreground, background)
    }
}

/// Get suggested accessible text color for a given background
pub fn get_accessible_text_color(
    background: Color32,
    level: A11yLevel,
) -> Color32 {
    let black = Color32::BLACK;
    let white = Color32::WHITE;
    
    if is_accessible(black, background, level, false) {
        black
    } else {
        white
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_a11y_level_normal_text() {
        assert!(A11yLevel::AA.meets_normal_text(Color32::BLACK, Color32::WHITE));
        assert!(A11yLevel::AAA.meets_normal_text(Color32::BLACK, Color32::WHITE));
    }

    #[test]
    fn test_a11y_level_large_text() {
        assert!(A11yLevel::AA.meets_large_text(Color32::BLACK, Color32::WHITE));
        assert!(A11yLevel::AAA.meets_large_text(Color32::BLACK, Color32::WHITE));
    }

    #[test]
    fn test_a11y_state_builder() {
        let state = A11yState::new()
            .checked(true)
            .disabled(false)
            .expanded(true);
        
        assert_eq!(state.checked, Some(true));
        assert_eq!(state.disabled, false);
        assert_eq!(state.expanded, Some(true));
    }

    #[test]
    fn test_is_accessible() {
        assert!(is_accessible(Color32::BLACK, Color32::WHITE, A11yLevel::AA, false));
    }

    #[test]
    fn test_get_accessible_text_color() {
        let white_bg = Color32::WHITE;
        let text_color = get_accessible_text_color(white_bg, A11yLevel::AA);
        assert_eq!(text_color, Color32::BLACK);
    }
}
