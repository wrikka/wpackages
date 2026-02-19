use super::{mode::AppMode, panel::FocusPanel};

/// Focus state for the application
#[derive(Debug, Clone)]
pub struct FocusState {
    /// Currently focused panel
    pub focused_panel: FocusPanel,
    /// Current application mode
    pub mode: AppMode,
    /// Whether command palette is visible
    pub command_palette_visible: bool,
    /// Whether help panel is visible
    pub help_visible: bool,
}

impl Default for FocusState {
    fn default() -> Self {
        Self {
            focused_panel: FocusPanel::FileExplorer,
            mode: AppMode::Normal,
            command_palette_visible: false,
            help_visible: false,
        }
    }
}

impl FocusState {
    /// Create new focus state
    pub fn new() -> Self {
        Self::default()
    }

    /// Set focus to a specific panel
    pub fn focus_panel(&mut self, panel: FocusPanel) {
        self.focused_panel = panel;
        self.update_mode_from_focus();
    }

    /// Move focus to next panel
    pub fn focus_next(&mut self) {
        self.focused_panel = self.focused_panel.next();
        self.update_mode_from_focus();
    }

    /// Move focus to previous panel
    pub fn focus_prev(&mut self) {
        self.focused_panel = self.focused_panel.prev();
        self.update_mode_from_focus();
    }

    /// Set application mode
    pub fn set_mode(&mut self, mode: AppMode) {
        self.mode = mode;
        self.update_focus_from_mode();
    }

    /// Show command palette
    pub fn show_command_palette(&mut self) {
        self.command_palette_visible = true;
        self.focused_panel = FocusPanel::CommandPalette;
        self.mode = AppMode::Command;
    }

    /// Hide command palette
    pub fn hide_command_palette(&mut self) {
        self.command_palette_visible = false;
        self.focused_panel = FocusPanel::InputField;
        self.mode = AppMode::Normal;
    }

    /// Toggle command palette visibility
    pub fn toggle_command_palette(&mut self) {
        if self.command_palette_visible {
            self.hide_command_palette();
        } else {
            self.show_command_palette();
        }
    }

    /// Show help panel
    pub fn show_help(&mut self) {
        self.help_visible = true;
    }

    /// Hide help panel
    pub fn hide_help(&mut self) {
        self.help_visible = false;
    }

    /// Toggle help panel visibility
    pub fn toggle_help(&mut self) {
        self.help_visible = !self.help_visible;
    }

    /// Check if a panel is focused
    pub fn is_focused(&self, panel: FocusPanel) -> bool {
        self.focused_panel == panel
    }

    /// Check if command palette is visible
    pub fn is_command_palette_visible(&self) -> bool {
        self.command_palette_visible
    }

    /// Check if help is visible
    pub fn is_help_visible(&self) -> bool {
        self.help_visible
    }

    /// Update mode based on current focus
    fn update_mode_from_focus(&mut self) {
        if self.command_palette_visible {
            self.mode = AppMode::Command;
        } else {
            self.mode = match self.focused_panel {
                FocusPanel::InputField => AppMode::Insert,
                FocusPanel::CommandPalette => AppMode::Command,
                _ => AppMode::Normal,
            };
        }
    }

    /// Update focus based on current mode
    fn update_focus_from_mode(&mut self) {
        match self.mode {
            AppMode::Command => {
                if !self.command_palette_visible {
                    self.show_command_palette();
                }
            }
            AppMode::Insert => {
                if self.focused_panel != FocusPanel::InputField {
                    self.focused_panel = FocusPanel::InputField;
                }
            }
            AppMode::Search => {
                if self.focused_panel != FocusPanel::FileExplorer {
                    self.focused_panel = FocusPanel::FileExplorer;
                }
            }
            AppMode::Plan => {
                // Keep focus unchanged for now
            }
            AppMode::Normal => {
                if self.command_palette_visible {
                    self.hide_command_palette();
                }
            }
        }
    }
}
