use crate::context::RsuiContext;
use eframe::egui::{self, Ui, Color32, FontId};

/// Text style for rich text editor
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TextStyle {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
}

/// Rich text editor state
#[derive(Debug, Clone)]
pub struct RichTextEditorState {
    pub text: String,
    pub selection: Option<(usize, usize)>,
    pub cursor_pos: usize,
    pub styles: Vec<(usize, usize, TextStyle)>,
}

impl Default for RichTextEditorState {
    fn default() -> Self {
        Self {
            text: String::new(),
            selection: None,
            cursor_pos: 0,
            styles: Vec::new(),
        }
    }
}

impl RichTextEditorState {
    pub fn new(text: String) -> Self {
        Self {
            text,
            selection: None,
            cursor_pos: 0,
            styles: Vec::new(),
        }
    }

    pub fn insert_text(&mut self, text: &str) {
        if let Some((start, end)) = self.selection {
            self.text.replace_range(start..end, text);
            self.cursor_pos = start + text.len();
            self.selection = None;
        } else {
            self.text.insert_str(self.cursor_pos, text);
            self.cursor_pos += text.len();
        }
    }

    pub fn delete_char(&mut self) {
        if let Some((start, end)) = self.selection {
            self.text.replace_range(start..end, "");
            self.cursor_pos = start;
            self.selection = None;
        } else if self.cursor_pos > 0 {
            self.text.remove(self.cursor_pos - 1);
            self.cursor_pos -= 1;
        }
    }

    pub fn apply_style(&mut self, style: TextStyle) {
        if let Some((start, end)) = self.selection {
            self.styles.push((start, end, style));
        }
    }
}

/// Rich text editor widget
///
/// A text editor with basic formatting capabilities
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The editor state
/// * `placeholder` - Optional placeholder text
///
/// # Examples
/// ```no_run
/// use rsui::{rich_text_editor, context::RsuiContext, components::rich_text_editor::RichTextEditorState};
///
/// let mut state = RichTextEditorState::default();
/// rich_text_editor(ui, rsui_ctx, &mut state, Some("Type something..."));
/// ```
pub fn rich_text_editor(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut RichTextEditorState,
    placeholder: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.input)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(12.0, 12.0))
        .show(ui, |ui| {
            // Toolbar
            ui.horizontal(|ui| {
                if ui.button("B").clicked() {
                    state.apply_style(TextStyle::Bold);
                }
                if ui.button("I").clicked() {
                    state.apply_style(TextStyle::Italic);
                }
                if ui.button("U").clicked() {
                    state.apply_style(TextStyle::Underline);
                }
                if ui.button("S").clicked() {
                    state.apply_style(TextStyle::Strikethrough);
                }
                if ui.button("<>").clicked() {
                    state.apply_style(TextStyle::Code);
                }
            });

            ui.separator();

            // Text area
            let text_edit = egui::TextEdit::multiline(&mut state.text)
                .desired_width(f32::INFINITY)
                .desired_rows(5)
                .hint_text(placeholder.unwrap_or(""));

            ui.add(text_edit);
        });
}

/// Simple rich text viewer (read-only)
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `text` - The text to display
///
/// # Examples
/// ```no_run
/// use rsui::{rich_text_viewer, context::RsuiContext};
///
/// rich_text_viewer(ui, rsui_ctx, "Some **bold** text");
/// ```
pub fn rich_text_viewer(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    text: &str,
) {
    let theme = &rsui_ctx.theme;

    egui::Frame::none()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .rounding(theme.radius)
        .inner_margin(egui::Margin::symmetric(12.0, 12.0))
        .show(ui, |ui| {
            // Simple markdown-like parsing
            let mut chars = text.chars().peekable();
            let mut buffer = String::new();
            let mut in_bold = false;
            let mut in_italic = false;
            let mut in_code = false;

            while let Some(c) = chars.next() {
                match c {
                    '*' => {
                        if chars.peek() == Some(&'*') {
                            chars.next();
                            if in_bold {
                                if !buffer.is_empty() {
                                    ui.label(egui::RichText::new(&buffer).strong());
                                    buffer.clear();
                                }
                                in_bold = false;
                            } else {
                                if !buffer.is_empty() {
                                    ui.label(buffer.clone());
                                    buffer.clear();
                                }
                                in_bold = true;
                            }
                        } else {
                            buffer.push(c);
                        }
                    }
                    '_' => {
                        if in_italic {
                            if !buffer.is_empty() {
                                ui.label(egui::RichText::new(&buffer).italics());
                                buffer.clear();
                            }
                            in_italic = false;
                        } else {
                            if !buffer.is_empty() {
                                ui.label(buffer.clone());
                                buffer.clear();
                            }
                            in_italic = true;
                        }
                    }
                    '`' => {
                        if in_code {
                            if !buffer.is_empty() {
                                ui.label(egui::RichText::new(&buffer).monospace());
                                buffer.clear();
                            }
                            in_code = false;
                        } else {
                            if !buffer.is_empty() {
                                ui.label(buffer.clone());
                                buffer.clear();
                            }
                            in_code = true;
                        }
                    }
                    '\n' => {
                        if !buffer.is_empty() {
                            let mut label = egui::RichText::new(&buffer);
                            if in_bold {
                                label = label.strong();
                            }
                            if in_italic {
                                label = label.italics();
                            }
                            if in_code {
                                label = label.monospace();
                            }
                            ui.label(label);
                            buffer.clear();
                        }
                        ui.add_space(4.0);
                    }
                    _ => {
                        buffer.push(c);
                    }
                }
            }

            // Handle remaining buffer
            if !buffer.is_empty() {
                let mut label = egui::RichText::new(&buffer);
                if in_bold {
                    label = label.strong();
                }
                if in_italic {
                    label = label.italics();
                }
                if in_code {
                    label = label.monospace();
                }
                ui.label(label);
            }
        });
}
