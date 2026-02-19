use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Tags input state
#[derive(Debug, Clone)]
pub struct TagsInputState {
    pub tags: Vec<String>,
    pub input: String,
    pub suggestions: Vec<String>,
    pub show_suggestions: bool,
}

impl Default for TagsInputState {
    fn default() -> Self {
        Self {
            tags: Vec::new(),
            input: String::new(),
            suggestions: Vec::new(),
            show_suggestions: false,
        }
    }
}

impl TagsInputState {
    pub fn new(suggestions: Vec<String>) -> Self {
        Self {
            tags: Vec::new(),
            input: String::new(),
            suggestions,
            show_suggestions: false,
        }
    }

    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) && !tag.is_empty() {
            self.tags.push(tag);
        }
        self.input.clear();
    }

    pub fn remove_tag(&mut self, index: usize) {
        if index < self.tags.len() {
            self.tags.remove(index);
        }
    }

    pub fn clear_tags(&mut self) {
        self.tags.clear();
    }

    pub fn tag_count(&self) -> usize {
        self.tags.len()
    }

    pub fn has_tag(&self, tag: &str) -> bool {
        self.tags.contains(&tag.to_string())
    }

    pub fn get_filtered_suggestions(&self) -> Vec<&String> {
        if self.input.is_empty() {
            Vec::new()
        } else {
            self.suggestions
                .iter()
                .filter(|s| {
                    !self.tags.contains(s) && 
                    s.to_lowercase().contains(&self.input.to_lowercase())
                })
                .collect()
        }
    }
}

/// Tags input widget
///
/// Add/remove tags with autocomplete
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The tags input state
/// * `placeholder` - Optional placeholder text
///
/// # Examples
/// ```no_run
/// use rsui::{tags_input, context::RsuiContext, components::tags_input::TagsInputState};
///
/// let suggestions = vec!["Rust".to_string(), "Python".to_string(), "JavaScript".to_string()];
/// let mut state = TagsInputState::new(suggestions);
/// tags_input(ui, rsui_ctx, &mut state, Some("Add tags..."));
/// ```
pub fn tags_input(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut TagsInputState,
    placeholder: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        let mut remove_index: Option<usize> = None;
        let mut selected_suggestion: Option<String> = None;

        // Tags display
        ui.horizontal_wrapped(|ui| {
            for (index, tag) in state.tags.iter().enumerate() {
                let tag_color = theme.primary;
                
                ui.horizontal(|ui| {
                    ui.label(egui::RichText::new(tag).color(tag_color));
                    if ui.small_button("×").clicked() {
                        remove_index = Some(index);
                    }
                });
            }
        });

        ui.add_space(8.0);

        // Input field
        let response = ui.text_edit_singleline(&mut state.input);
        
        if state.input.is_empty() {
            if let Some(p) = placeholder {
                ui.label(egui::RichText::new(p).weak().italics());
            }
        }

        // Handle Enter key to add tag
        if response.lost_focus() || response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if !state.input.is_empty() {
                    state.add_tag(state.input.clone());
                }
            }
            if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                state.show_suggestions = false;
            }
        }

        // Show suggestions
        if !state.input.is_empty() {
            let filtered: Vec<String> = state
                .get_filtered_suggestions()
                .into_iter()
                .cloned()
                .collect();
            
            if !filtered.is_empty() {
                state.show_suggestions = true;
                ui.add_space(8.0);
                
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for suggestion in filtered {
                                let response = ui.horizontal(|ui| {
                                    ui.label(&suggestion);
                                });
                                
                                if response.response.clicked() {
                                    selected_suggestion = Some(suggestion.clone());
                                }
                            }
                        });
                    });
            } else {
                state.show_suggestions = false;
            }
        }

        if let Some(index) = remove_index {
            state.remove_tag(index);
        }

        if let Some(tag) = selected_suggestion {
            state.add_tag(tag);
        }
    });
}

/// Compact tags input widget
///
/// Smaller version for limited space
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The tags input state
///
/// # Examples
/// ```no_run
/// use rsui::{tags_input_compact, context::RsuiContext, components::tags_input::TagsInputState};
///
/// let mut state = TagsInputState::new(vec![]);
/// tags_input_compact(ui, rsui_ctx, &mut state);
/// ```
pub fn tags_input_compact(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut TagsInputState,
) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        // Tags display (compact)
        let max_display = 3;
        let display_count = state.tags.len().min(max_display);
        
        for tag in state.tags.iter().take(display_count) {
            ui.label(egui::RichText::new(tag).color(theme.primary));
        }
        
        if state.tags.len() > max_display {
            ui.label(format!("+{}", state.tags.len() - max_display));
        }

        ui.add_space(8.0);

        // Input field
        let response = ui.add(
            egui::TextEdit::singleline(&mut state.input)
                .hint_text("Add tag...")
        );

        // Handle Enter key
        if response.lost_focus() || response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if !state.input.is_empty() {
                    state.add_tag(state.input.clone());
                }
            }
        }
    });
}

/// Tags input with custom tag renderer
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The tags input state
/// * `render_tag` - Custom tag renderer
/// * `placeholder` - Optional placeholder text
///
/// # Examples
/// ```no_run
/// use rsui::{tags_input_with_renderer, context::RsuiContext, components::tags_input::TagsInputState};
///
/// let mut state = TagsInputState::new(vec![]);
/// tags_input_with_renderer(ui, rsui_ctx, &mut state, |ui, tag| {
///     ui.label(format!("🏷️ {}", tag));
/// }, Some("Add tags..."));
/// ```
pub fn tags_input_with_renderer(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut TagsInputState,
    render_tag: impl Fn(&mut Ui, &str),
    placeholder: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        let mut remove_index: Option<usize> = None;
        let mut selected_suggestion: Option<String> = None;

        // Tags display
        ui.horizontal_wrapped(|ui| {
            for (index, tag) in state.tags.iter().enumerate() {
                ui.horizontal(|ui| {
                    render_tag(ui, tag);
                    if ui.small_button("×").clicked() {
                        remove_index = Some(index);
                    }
                });
            }
        });

        ui.add_space(8.0);

        // Input field
        let response = ui.text_edit_singleline(&mut state.input);
        
        if state.input.is_empty() {
            if let Some(p) = placeholder {
                ui.label(egui::RichText::new(p).weak().italics());
            }
        }

        // Handle Enter key
        if response.lost_focus() || response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if !state.input.is_empty() {
                    state.add_tag(state.input.clone());
                }
            }
        }

        // Show suggestions
        if !state.input.is_empty() {
            let filtered: Vec<String> = state
                .get_filtered_suggestions()
                .into_iter()
                .cloned()
                .collect();
            
            if !filtered.is_empty() {
                ui.add_space(8.0);
                
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for suggestion in filtered {
                                let response = ui.horizontal(|ui| {
                                    ui.label(&suggestion);
                                });
                                
                                if response.response.clicked() {
                                    selected_suggestion = Some(suggestion.clone());
                                }
                            }
                        });
                    });
            }
        }

        if let Some(index) = remove_index {
            state.remove_tag(index);
        }

        if let Some(tag) = selected_suggestion {
            state.add_tag(tag);
        }
    });
}

/// Tags input with validation
///
/// Tags input with custom validation rules
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The tags input state
/// * `validator` - Tag validation function
/// * `placeholder` - Optional placeholder text
///
/// # Returns
/// * Whether the tag was added successfully
///
/// # Examples
/// ```no_run
/// use rsui::{tags_input_with_validation, context::RsuiContext, components::tags_input::TagsInputState};
///
/// let mut state = TagsInputState::new(vec![]);
/// let added = tags_input_with_validation(ui, rsui_ctx, &mut state, |tag| {
///     tag.len() <= 20
/// }, Some("Add tags..."));
/// ```
pub fn tags_input_with_validation(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut TagsInputState,
    validator: impl Fn(&str) -> bool,
    placeholder: Option<&str>,
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut added = false;

    ui.vertical(|ui| {
        let mut remove_index: Option<usize> = None;
        let mut selected_suggestion: Option<String> = None;

        // Tags display
        ui.horizontal_wrapped(|ui| {
            for (index, tag) in state.tags.iter().enumerate() {
                ui.horizontal(|ui| {
                    ui.label(egui::RichText::new(tag).color(theme.primary));
                    if ui.small_button("×").clicked() {
                        remove_index = Some(index);
                    }
                });
            }
        });

        ui.add_space(8.0);

        // Input field
        let response = ui.text_edit_singleline(&mut state.input);
        
        if state.input.is_empty() {
            if let Some(p) = placeholder {
                ui.label(egui::RichText::new(p).weak().italics());
            }
        }

        // Handle Enter key
        if response.lost_focus() || response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if !state.input.is_empty() {
                    let tag = state.input.clone();
                    if validator(&tag) {
                        state.add_tag(tag);
                        added = true;
                    } else {
                        ui.colored_label(egui::Color32::RED, "Invalid tag");
                    }
                }
            }
        }

        // Show suggestions
        if !state.input.is_empty() {
            let filtered: Vec<String> = state
                .get_filtered_suggestions()
                .into_iter()
                .cloned()
                .collect();
            
            if !filtered.is_empty() {
                ui.add_space(8.0);
                
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for suggestion in filtered {
                                let response = ui.horizontal(|ui| {
                                    ui.label(&suggestion);
                                });
                                
                                if response.response.clicked() {
                                    selected_suggestion = Some(suggestion.clone());
                                }
                            }
                        });
                    });
            }
        }

        if let Some(index) = remove_index {
            state.remove_tag(index);
        }

        if let Some(tag) = selected_suggestion {
            state.add_tag(tag);
            added = true;
        }
    });

    added
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tags_input_state() {
        let mut state = TagsInputState::new(vec!["Rust".to_string(), "Python".to_string()]);
        
        assert_eq!(state.tag_count(), 0);
        
        state.add_tag("Rust".to_string());
        assert_eq!(state.tag_count(), 1);
        assert!(state.has_tag("Rust"));
        
        state.add_tag("Rust".to_string()); // Duplicate
        assert_eq!(state.tag_count(), 1);
        
        state.add_tag("Python".to_string());
        assert_eq!(state.tag_count(), 2);
        
        state.remove_tag(0);
        assert_eq!(state.tag_count(), 1);
        assert!(!state.has_tag("Rust"));
    }

    #[test]
    fn test_get_filtered_suggestions() {
        let suggestions = vec!["Rust".to_string(), "Python".to_string(), "JavaScript".to_string()];
        let mut state = TagsInputState::new(suggestions);
        
        state.input = "r".to_string();
        let filtered = state.get_filtered_suggestions();
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0], "Rust");
        
        state.tags.push("Rust".to_string());
        let filtered = state.get_filtered_suggestions();
        assert_eq!(filtered.len(), 0); // Rust already added
    }

    #[test]
    fn test_clear_tags() {
        let mut state = TagsInputState::new(vec![]);
        
        state.add_tag("A".to_string());
        state.add_tag("B".to_string());
        assert_eq!(state.tag_count(), 2);
        
        state.clear_tags();
        assert_eq!(state.tag_count(), 0);
    }
}
