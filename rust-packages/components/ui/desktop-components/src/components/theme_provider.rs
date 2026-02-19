use crate::context::RsuiContext;
use crate::types::theme::RsuiTheme;
use crate::types::theme_variables::{ThemeVariables, ThemeVariable};
use eframe::egui::{self, Ui};
use std::sync::Arc;

/// Theme mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ThemeMode {
    Light,
    Dark,
    Auto,
}

impl ThemeMode {
    pub fn as_str(&self) -> &str {
        match self {
            ThemeMode::Light => "light",
            ThemeMode::Dark => "dark",
            ThemeMode::Auto => "auto",
        }
    }
}

/// Theme provider state
#[derive(Debug, Clone)]
pub struct ThemeProviderState {
    pub current_theme: RsuiTheme,
    pub theme_mode: ThemeMode,
    pub custom_variables: ThemeVariables,
}

impl Default for ThemeProviderState {
    fn default() -> Self {
        Self {
            current_theme: RsuiTheme::light(),
            theme_mode: ThemeMode::Light,
            custom_variables: ThemeVariables::new(),
        }
    }
}

impl ThemeProviderState {
    pub fn new(theme: RsuiTheme, mode: ThemeMode) -> Self {
        Self {
            current_theme: theme,
            theme_mode: mode,
            custom_variables: ThemeVariables::new(),
        }
    }

    pub fn set_theme(&mut self, theme: RsuiTheme) {
        self.current_theme = theme;
    }

    pub fn set_mode(&mut self, mode: ThemeMode) {
        self.theme_mode = mode;
    }

    pub fn toggle_mode(&mut self) {
        self.theme_mode = match self.theme_mode {
            ThemeMode::Light => ThemeMode::Dark,
            ThemeMode::Dark => ThemeMode::Light,
            ThemeMode::Auto => ThemeMode::Light,
        };
    }

    pub fn add_variable(&mut self, variable: ThemeVariable) {
        self.custom_variables.insert(variable);
    }

    pub fn get_variable(&self, name: &str) -> Option<&ThemeVariable> {
        self.custom_variables.get(name)
    }
}

/// Theme provider widget
///
/// Provides theme context to child components
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme provider state
/// * `content` - Function to render child components
///
/// # Examples
/// ```no_run
/// use rsui::{theme_provider, context::RsuiContext, components::theme_provider::{ThemeProviderState, ThemeMode}};
///
/// let mut state = ThemeProviderState::default();
/// theme_provider(ui, rsui_ctx, &mut state, |ui, ctx| {
///     ui.label("Content with theme");
/// });
/// ```
pub fn theme_provider(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ThemeProviderState,
    content: impl FnOnce(&mut Ui, &RsuiContext),
) {
    // Apply theme to context
    let mut themed_ctx = rsui_ctx.clone();
    themed_ctx.theme = Arc::new(state.current_theme.clone());

    // Render content with themed context
    content(ui, &themed_ctx);
}

/// Theme provider with mode detection
///
/// Automatically detects system theme preference when in Auto mode
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme provider state
/// * `content` - Function to render child components
///
/// # Examples
/// ```no_run
/// use rsui::{theme_provider_auto, context::RsuiContext, components::theme_provider::{ThemeProviderState, ThemeMode}};
///
/// let mut state = ThemeProviderState::default();
/// state.set_mode(ThemeMode::Auto);
/// theme_provider_auto(ui, rsui_ctx, &mut state, |ui, ctx| {
///     ui.label("Content with auto theme");
/// });
/// ```
pub fn theme_provider_auto(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ThemeProviderState,
    content: impl FnOnce(&mut Ui, &RsuiContext),
) {
    // Detect system theme if in Auto mode
    let theme = if state.theme_mode == ThemeMode::Auto {
        let prefers_dark = ui.ctx().style().visuals.dark_mode;
        if prefers_dark {
            RsuiTheme::dark()
        } else {
            RsuiTheme::light()
        }
    } else {
        state.current_theme.clone()
    };

    let mut themed_ctx = rsui_ctx.clone();
    themed_ctx.theme = Arc::new(theme);

    content(ui, &themed_ctx);
}

/// Theme provider with custom variables
///
/// Allows customizing theme variables at runtime
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme provider state
/// * `content` - Function to render child components
///
/// # Examples
/// ```no_run
/// use rsui::{theme_provider_with_variables, context::RsuiContext, components::theme_provider::ThemeProviderState};
///
/// let mut state = ThemeProviderState::default();
/// theme_provider_with_variables(ui, rsui_ctx, &mut state, |ui, ctx| {
///     ui.label("Content with custom theme variables");
/// });
/// ```
pub fn theme_provider_with_variables(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ThemeProviderState,
    content: impl FnOnce(&mut Ui, &RsuiContext),
) {
    let mut themed_ctx = rsui_ctx.clone();
    let mut theme = state.current_theme.clone();

    // Apply custom variables to theme
    for (name, variable) in state.custom_variables.iter() {
        // Apply variable to theme if applicable
        match &variable.value {
            crate::types::theme_variables::ThemeVariableValue::Color(color) => {
                if name == "primary" {
                    theme.primary = parse_color(color);
                }
            }
            _ => {}
        }
    }

    themed_ctx.theme = Arc::new(theme);

    content(ui, &themed_ctx);
}

/// Parse color string to egui Color32
fn parse_color(s: &str) -> eframe::egui::Color32 {
    if s.starts_with('#') {
        let hex = &s[1..];
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0);
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0);
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0);
        eframe::egui::Color32::from_rgb(r, g, b)
    } else {
        eframe::egui::Color32::WHITE
    }
}

/// Theme context for nested components
#[derive(Debug, Clone)]
pub struct ThemeContext {
    pub theme: RsuiTheme,
    pub mode: ThemeMode,
    pub variables: ThemeVariables,
}

impl ThemeContext {
    pub fn new(theme: RsuiTheme, mode: ThemeMode) -> Self {
        Self {
            theme,
            mode,
            variables: ThemeVariables::new(),
        }
    }

    pub fn from_provider_state(state: &ThemeProviderState) -> Self {
        Self {
            theme: state.current_theme.clone(),
            mode: state.theme_mode,
            variables: state.custom_variables.clone(),
        }
    }

    pub fn with_variables(mut self, variables: ThemeVariables) -> Self {
        self.variables = variables;
        self
    }
}

impl Default for ThemeContext {
    fn default() -> Self {
        Self::new(RsuiTheme::light(), ThemeMode::Light)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_theme_mode() {
        assert_eq!(ThemeMode::Light.as_str(), "light");
        assert_eq!(ThemeMode::Dark.as_str(), "dark");
        assert_eq!(ThemeMode::Auto.as_str(), "auto");
    }

    #[test]
    fn test_theme_provider_state() {
        let mut state = ThemeProviderState::default();
        
        assert_eq!(state.theme_mode, ThemeMode::Light);
        
        state.set_mode(ThemeMode::Dark);
        assert_eq!(state.theme_mode, ThemeMode::Dark);
        
        state.toggle_mode();
        assert_eq!(state.theme_mode, ThemeMode::Light);
    }

    #[test]
    fn test_theme_context() {
        let context = ThemeContext::default();
        assert_eq!(context.mode, ThemeMode::Light);
        
        let context = ThemeContext::new(RsuiTheme::dark(), ThemeMode::Dark);
        assert_eq!(context.mode, ThemeMode::Dark);
    }

    #[test]
    fn test_parse_color() {
        let color = parse_color("#ffffff");
        assert_eq!(color, eframe::egui::Color32::WHITE);
        
        let color = parse_color("#000000");
        assert_eq!(color, eframe::egui::Color32::BLACK);
        
        let color = parse_color("#3b82f6");
        let [r, g, b, a] = color.to_array();
        assert_eq!(r, 59);
        assert_eq!(g, 130);
        assert_eq!(b, 246);
    }
}
