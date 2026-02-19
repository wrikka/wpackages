use crate::context::RsuiContext;
use crate::types::theme::RsuiTheme;
use eframe::egui::{self, Ui};
use super::theme_provider::ThemeMode;

/// Theme switcher state
#[derive(Debug, Clone)]
pub struct ThemeSwitcherState {
    pub current_mode: ThemeMode,
    pub show_dropdown: bool,
}

impl Default for ThemeSwitcherState {
    fn default() -> Self {
        Self {
            current_mode: ThemeMode::Light,
            show_dropdown: false,
        }
    }
}

impl ThemeSwitcherState {
    pub fn new(mode: ThemeMode) -> Self {
        Self {
            current_mode: mode,
            show_dropdown: false,
        }
    }

    pub fn set_mode(&mut self, mode: ThemeMode) {
        self.current_mode = mode;
    }

    pub fn toggle_dropdown(&mut self) {
        self.show_dropdown = !self.show_dropdown;
    }

    pub fn close_dropdown(&mut self) {
        self.show_dropdown = false;
    }

    pub fn get_theme(&self) -> RsuiTheme {
        match self.current_mode {
            ThemeMode::Light => RsuiTheme::light(),
            ThemeMode::Dark => RsuiTheme::dark(),
            ThemeMode::Auto => RsuiTheme::light(), // Default to light for Auto
        }
    }
}

/// Theme switcher widget
///
/// UI for changing themes (Light/Dark/Auto)
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme switcher state
///
/// # Returns
/// * Whether the theme was changed
///
/// # Examples
/// ```no_run
/// use rsui::{theme_switcher, context::RsuiContext, components::theme_switcher::ThemeSwitcherState};
///
/// let mut state = ThemeSwitcherState::default();
/// let changed = theme_switcher(ui, rsui_ctx, &mut state);
/// if changed {
///     println!("Theme changed!");
/// }
/// ```
pub fn theme_switcher(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut ThemeSwitcherState) -> bool {
    let theme = &rsui_ctx.theme;
    let mut changed = false;

    ui.horizontal(|ui| {
        // Theme icon
        let icon = match state.current_mode {
            ThemeMode::Light => "☀️",
            ThemeMode::Dark => "🌙",
            ThemeMode::Auto => "🌓",
        };

        let icon_response = ui.small_button(icon);
        if icon_response.clicked() {
            state.toggle_dropdown();
        }

        // Dropdown menu
        if state.show_dropdown {
            egui::Area::new(ui.next_auto_id())
                .order(egui::Order::Foreground)
                .fixed_pos(icon_response.rect.left_bottom() + egui::vec2(0.0, 4.0))
                .show(ui.ctx(), |ui| {
                    egui::Frame::none()
                        .fill(theme.card)
                        .stroke(egui::Stroke::new(1.0, theme.border))
                        .rounding(theme.radius)
                        .show(ui, |ui| {
                            ui.vertical(|ui| {
                                if ui.button("☀️ Light").clicked() {
                                    state.set_mode(ThemeMode::Light);
                                    state.close_dropdown();
                                    changed = true;
                                }
                                if ui.button("🌙 Dark").clicked() {
                                    state.set_mode(ThemeMode::Dark);
                                    state.close_dropdown();
                                    changed = true;
                                }
                                if ui.button("🌓 Auto").clicked() {
                                    state.set_mode(ThemeMode::Auto);
                                    state.close_dropdown();
                                    changed = true;
                                }
                            });
                        });
                });
        }

        // Close dropdown when clicking outside
        if ui.input(|i| i.pointer.any_click()) && state.show_dropdown {
            let click_pos = ui.input(|i| i.pointer.interact_pos());
            let dropdown_rect = ui.next_auto_id(); // This is a simplified check
            // In a real implementation, you'd need to track the dropdown position
            state.close_dropdown();
        }
    });

    changed
}

/// Compact theme switcher widget
///
/// Smaller version for limited space
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme switcher state
///
/// # Returns
/// * Whether the theme was changed
///
/// # Examples
/// ```no_run
/// use rsui::{theme_switcher_compact, context::RsuiContext, components::theme_switcher::ThemeSwitcherState};
///
/// let mut state = ThemeSwitcherState::default();
/// let changed = theme_switcher_compact(ui, rsui_ctx, &mut state);
/// ```
pub fn theme_switcher_compact(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut ThemeSwitcherState) -> bool {
    let theme = &rsui_ctx.theme;
    let mut changed = false;

    // Toggle button
    let icon = match state.current_mode {
        ThemeMode::Light => "☀️",
        ThemeMode::Dark => "🌙",
        ThemeMode::Auto => "🌓",
    };

    if ui.small_button(icon).clicked() {
        state.current_mode = match state.current_mode {
            ThemeMode::Light => ThemeMode::Dark,
            ThemeMode::Dark => ThemeMode::Auto,
            ThemeMode::Auto => ThemeMode::Light,
        };
        changed = true;
    }

    changed
}

/// Theme switcher with label
///
/// Theme switcher with descriptive label
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme switcher state
/// * `label` - Optional label text
///
/// # Returns
/// * Whether the theme was changed
///
/// # Examples
/// ```no_run
/// use rsui::{theme_switcher_with_label, context::RsuiContext, components::theme_switcher::ThemeSwitcherState};
///
/// let mut state = ThemeSwitcherState::default();
/// let changed = theme_switcher_with_label(ui, rsui_ctx, &mut state, Some("Theme"));
/// ```
pub fn theme_switcher_with_label(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ThemeSwitcherState,
    label: Option<&str>,
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut changed = false;

    ui.horizontal(|ui| {
        if let Some(l) = label {
            ui.label(l);
            ui.add_space(8.0);
        }

        changed = theme_switcher_compact(ui, rsui_ctx, state);
    });

    changed
}

/// Theme switcher with preview
///
/// Shows color preview of the current theme
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme switcher state
///
/// # Returns
/// * Whether the theme was changed
///
/// # Examples
/// ```no_run
/// use rsui::{theme_switcher_with_preview, context::RsuiContext, components::theme_switcher::ThemeSwitcherState};
///
/// let mut state = ThemeSwitcherState::default();
/// let changed = theme_switcher_with_preview(ui, rsui_ctx, &mut state);
/// ```
pub fn theme_switcher_with_preview(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut ThemeSwitcherState,
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut changed = false;

    ui.horizontal(|ui| {
        // Color preview
        let rect = ui.allocate_space(egui::Vec2::new(24.0, 24.0)).1;
        let painter = ui.painter();
        
        painter.circle(
            rect.center(),
            10.0,
            theme.primary,
            egui::Stroke::new(1.0, theme.border),
        );

        ui.add_space(8.0);

        // Switcher
        changed = theme_switcher_compact(ui, rsui_ctx, state);
    });

    changed
}

/// Theme switcher with system detection
///
/// Automatically detects system theme preference
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The theme switcher state
///
/// # Returns
/// * Whether the theme was changed
///
/// # Examples
/// ```no_run
/// use rsui::{theme_switcher_auto, context::RsuiContext, components::theme_switcher::ThemeSwitcherState};
///
/// let mut state = ThemeSwitcherState::default();
/// let changed = theme_switcher_auto(ui, rsui_ctx, &mut state);
/// ```
pub fn theme_switcher_auto(ui: &mut Ui, rsui_ctx: &RsuiContext, state: &mut ThemeSwitcherState) -> bool {
    let mut changed = false;

    // Detect system theme
    let prefers_dark = ui.ctx().style().visuals.dark_mode;
    
    // Auto-update if in Auto mode
    if state.current_mode == ThemeMode::Auto {
        let system_mode = if prefers_dark {
            ThemeMode::Dark
        } else {
            ThemeMode::Light
        };
        
        // Update internal state for display
        // Note: This doesn't change the actual mode, just what's displayed
    }

    changed = theme_switcher(ui, rsui_ctx, state);
    changed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_theme_switcher_state() {
        let mut state = ThemeSwitcherState::default();
        
        assert_eq!(state.current_mode, ThemeMode::Light);
        assert!(!state.show_dropdown);
        
        state.toggle_dropdown();
        assert!(state.show_dropdown);
        
        state.close_dropdown();
        assert!(!state.show_dropdown);
        
        state.set_mode(ThemeMode::Dark);
        assert_eq!(state.current_mode, ThemeMode::Dark);
    }

    #[test]
    fn test_get_theme() {
        let state = ThemeSwitcherState::new(ThemeMode::Light);
        let theme = state.get_theme();
        // Verify theme is created (implementation-specific)
    }
}
