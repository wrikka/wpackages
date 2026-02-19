use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default)]
pub struct DocumentationModeState {
    pub is_active: bool,
    pub show_line_numbers: bool,
    pub show_status_bar: bool,
    pub show_side_panels: bool,
    pub show_minimap: bool,
    pub show_breadcrumbs: bool,
    pub show_inline_blame: bool,
    pub font_size: u16,
    pub line_height: f32,
    pub wrap_mode: WrapMode,
    pub focus_mode: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum WrapMode {
    None,
    Word,
    Character,
}

impl DocumentationModeState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn activate(&mut self) {
        self.is_active = true;
        self.show_line_numbers = false;
        self.show_status_bar = false;
        self.show_side_panels = false;
        self.show_minimap = false;
        self.show_breadcrumbs = false;
        self.show_inline_blame = false;
        self.font_size = 16;
        self.line_height = 1.8;
        self.wrap_mode = WrapMode::Word;
        self.focus_mode = true;
    }

    pub fn deactivate(&mut self) {
        self.is_active = false;
        self.show_line_numbers = true;
        self.show_status_bar = true;
        self.show_side_panels = true;
        self.show_minimap = true;
        self.show_breadcrumbs = true;
        self.show_inline_blame = true;
        self.font_size = 14;
        self.line_height = 1.5;
        self.wrap_mode = WrapMode::None;
        self.focus_mode = false;
    }

    pub fn toggle(&mut self) {
        if self.is_active {
            self.deactivate();
        } else {
            self.activate();
        }
    }
}
