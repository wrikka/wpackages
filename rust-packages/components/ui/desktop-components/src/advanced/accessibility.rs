//! Accessibility support
//! 
//! Provides accessibility features for screen readers and assistive technologies

/// Accessibility role
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AccessibilityRole {
    None,
    Button,
    Link,
    Text,
    Heading,
    Image,
    List,
    ListItem,
    TextField,
    Checkbox,
    Radio,
    ComboBox,
    Slider,
    ProgressBar,
    Dialog,
    Alert,
}

/// Accessibility state
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AccessibilityState {
    None,
    Disabled,
    Selected,
    Checked,
    Expanded,
    Collapsed,
    Busy,
    Hidden,
}

/// Accessibility attributes
#[derive(Debug, Clone)]
pub struct AccessibilityAttributes {
    pub role: AccessibilityRole,
    pub label: Option<String>,
    pub description: Option<String>,
    pub state: AccessibilityState,
    pub value: Option<String>,
    pub min_value: Option<f32>,
    pub max_value: Option<f32>,
    pub step: Option<f32>,
}

impl Default for AccessibilityAttributes {
    fn default() -> Self {
        Self {
            role: AccessibilityRole::None,
            label: None,
            description: None,
            state: AccessibilityState::None,
            value: None,
            min_value: None,
            max_value: None,
            step: None,
        }
    }
}

impl AccessibilityAttributes {
    /// Create new accessibility attributes
    pub fn new(role: AccessibilityRole) -> Self {
        Self {
            role,
            ..Default::default()
        }
    }

    /// Set label
    pub fn with_label(mut self, label: String) -> Self {
        self.label = Some(label);
        self
    }

    /// Set description
    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    /// Set state
    pub fn with_state(mut self, state: AccessibilityState) -> Self {
        self.state = state;
        self
    }

    /// Set value
    pub fn with_value(mut self, value: String) -> Self {
        self.value = Some(value);
        self
    }

    /// Set range
    pub fn with_range(mut self, min: f32, max: f32, step: f32) -> Self {
        self.min_value = Some(min);
        self.max_value = Some(max);
        self.step = Some(step);
        self
    }
}

/// Accessibility manager
pub struct AccessibilityManager {
    focus_id: Option<String>,
}

impl AccessibilityManager {
    /// Create new accessibility manager
    pub fn new() -> Self {
        Self {
            focus_id: None,
        }
    }

    /// Set focus
    pub fn set_focus(&mut self, id: String) {
        self.focus_id = Some(id);
    }

    /// Clear focus
    pub fn clear_focus(&mut self) {
        self.focus_id = None;
    }

    /// Get focused element
    pub fn focused_element(&self) -> Option<&str> {
        self.focus_id.as_deref()
    }
}

impl Default for AccessibilityManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_accessibility() {
        let attrs = AccessibilityAttributes::new(AccessibilityRole::Button)
            .with_label("Click me".to_string())
            .with_state(AccessibilityState::None);
        
        assert_eq!(attrs.role, AccessibilityRole::Button);
        assert_eq!(attrs.label, Some("Click me".to_string()));
    }
}
