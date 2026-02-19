use super::panel::FocusPanel;

/// Panel visibility state
#[derive(Debug, Clone, Default)]
pub struct PanelVisibility {
    pub file_explorer: bool,
    pub chat_panel: bool,
    pub output_display: bool,
}

impl PanelVisibility {
    /// Create new visibility state with all panels visible
    pub fn new() -> Self {
        Self {
            file_explorer: true,
            chat_panel: bool::default(),
            output_display: bool::default(),
        }
    }

    /// Toggle panel visibility
    pub fn toggle(&mut self, panel: FocusPanel) {
        match panel {
            FocusPanel::FileExplorer => self.file_explorer = !self.file_explorer,
            FocusPanel::ChatPanel => self.chat_panel = !self.chat_panel,
            FocusPanel::OutputDisplay => self.output_display = !self.output_display,
            _ => {}
        }
    }

    /// Check if panel is visible
    pub fn is_visible(&self, panel: FocusPanel) -> bool {
        match panel {
            FocusPanel::FileExplorer => self.file_explorer,
            FocusPanel::ChatPanel => self.chat_panel,
            FocusPanel::OutputDisplay => self.output_display,
            FocusPanel::InputField | FocusPanel::CommandPalette => true,
        }
    }

    /// Count visible panels
    pub fn visible_count(&self) -> usize {
        let mut count = 0;
        if self.file_explorer {
            count += 1;
        }
        if self.chat_panel {
            count += 1;
        }
        if self.output_display {
            count += 1;
        }
        count
    }
}
