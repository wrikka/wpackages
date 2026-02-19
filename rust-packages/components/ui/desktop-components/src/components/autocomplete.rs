use crate::context::RsuiContext;
use eframe::egui::{self, Ui};

/// Autocomplete state
#[derive(Debug, Clone)]
pub struct AutocompleteState {
    pub query: String,
    pub suggestions: Vec<String>,
    pub selected_index: Option<usize>,
    pub show_dropdown: bool,
}

impl Default for AutocompleteState {
    fn default() -> Self {
        Self {
            query: String::new(),
            suggestions: Vec::new(),
            selected_index: None,
            show_dropdown: false,
        }
    }
}

impl AutocompleteState {
    pub fn new(suggestions: Vec<String>) -> Self {
        Self {
            query: String::new(),
            suggestions,
            selected_index: None,
            show_dropdown: false,
        }
    }

    pub fn set_suggestions(&mut self, suggestions: Vec<String>) {
        self.suggestions = suggestions;
        self.selected_index = None;
    }

    pub fn update_query(&mut self, query: String) {
        self.query = query;
        self.selected_index = None;
    }

    pub fn select_next(&mut self) {
        if self.suggestions.is_empty() {
            return;
        }

        let max_index = self.suggestions.len() - 1;
        self.selected_index = Some(match self.selected_index {
            Some(index) => {
                if index >= max_index {
                    0
                } else {
                    index + 1
                }
            }
            None => 0,
        });
    }

    pub fn select_previous(&mut self) {
        if self.suggestions.is_empty() {
            return;
        }

        let max_index = self.suggestions.len() - 1;
        self.selected_index = Some(match self.selected_index {
            Some(index) => {
                if index == 0 {
                    max_index
                } else {
                    index - 1
                }
            }
            None => max_index,
        });
    }

    pub fn select_index(&mut self, index: usize) {
        if index < self.suggestions.len() {
            self.selected_index = Some(index);
        }
    }

    pub fn get_selected(&self) -> Option<&String> {
        self.selected_index.and_then(|i| self.suggestions.get(i))
    }

    pub fn clear_selection(&mut self) {
        self.selected_index = None;
    }

    pub fn get_filtered(&self) -> Vec<&String> {
        if self.query.is_empty() {
            self.suggestions.iter().collect()
        } else {
            self.suggestions
                .iter()
                .filter(|s| s.to_lowercase().contains(&self.query.to_lowercase()))
                .collect()
        }
    }
}

/// Autocomplete widget
///
/// Search and select from dropdown
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The autocomplete state
/// * `placeholder` - Optional placeholder text
///
/// # Returns
/// * Whether a suggestion was selected
///
/// # Examples
/// ```no_run
/// use rsui::{autocomplete, context::RsuiContext, components::autocomplete::AutocompleteState};
///
/// let suggestions = vec!["Apple".to_string(), "Banana".to_string(), "Cherry".to_string()];
/// let mut state = AutocompleteState::new(suggestions);
/// let selected = autocomplete(ui, rsui_ctx, &mut state, Some("Search fruits"));
/// ```
pub fn autocomplete(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut AutocompleteState,
    placeholder: Option<&str>,
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut selected = false;

    ui.vertical(|ui| {
        // Input field
        let response = ui.text_edit_singleline(&mut state.query);
        
        if state.query.is_empty() {
            if let Some(p) = placeholder {
                ui.label(egui::RichText::new(p).weak().italics());
            }
        }

        // Handle keyboard navigation
        if response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::ArrowDown)) {
                state.select_next();
            }
            if ui.input(|i| i.key_pressed(egui::Key::ArrowUp)) {
                state.select_previous();
            }
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if let Some(s) = state.get_selected() {
                    state.query = s.clone();
                    state.show_dropdown = false;
                    selected = true;
                }
            }
            if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                state.show_dropdown = false;
            }
        }

        // Show dropdown when typing
        if !state.query.is_empty() || state.show_dropdown {
            state.show_dropdown = true;
            
            let filtered = state.get_filtered();
            
            if !filtered.is_empty() {
                ui.add_space(8.0);
                
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for (index, suggestion) in filtered.iter().enumerate() {
                                let is_selected = state.selected_index == Some(index);
                                
                                let response = ui.horizontal(|ui| {
                                    if is_selected {
                                        ui.label(egui::RichText::new(suggestion).strong().color(theme.primary));
                                    } else {
                                        ui.label(suggestion);
                                    }
                                });
                                
                                if response.hovered() {
                                    state.select_index(index);
                                }
                                
                                if response.clicked() {
                                    state.query = suggestion.clone();
                                    state.show_dropdown = false;
                                    selected = true;
                                }
                            }
                        });
                    });
            }
        }
    });

    selected
}

/// Autocomplete with custom suggestion renderer
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The autocomplete state
/// * `render_suggestion` - Custom suggestion renderer
///
/// # Returns
/// * Whether a suggestion was selected
///
/// # Examples
/// ```no_run
/// use rsui::{autocomplete_with_renderer, context::RsuiContext, components::autocomplete::AutocompleteState};
///
/// let suggestions = vec!["A".to_string(), "B".to_string()];
/// let mut state = AutocompleteState::new(suggestions);
/// let selected = autocomplete_with_renderer(ui, rsui_ctx, &mut state, |ui, suggestion, is_selected| {
///     ui.label(format!("{} {}", if is_selected { "→" } else { "  " }, suggestion));
/// });
/// ```
pub fn autocomplete_with_renderer(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut AutocompleteState,
    render_suggestion: impl Fn(&mut Ui, &str, bool),
) -> bool {
    let theme = &rsui_ctx.theme;
    let mut selected = false;

    ui.vertical(|ui| {
        // Input field
        let response = ui.text_edit_singleline(&mut state.query);

        // Handle keyboard navigation
        if response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::ArrowDown)) {
                state.select_next();
            }
            if ui.input(|i| i.key_pressed(egui::Key::ArrowUp)) {
                state.select_previous();
            }
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if let Some(s) = state.get_selected() {
                    state.query = s.clone();
                    state.show_dropdown = false;
                    selected = true;
                }
            }
        }

        // Show dropdown
        if !state.query.is_empty() {
            let filtered = state.get_filtered();
            
            if !filtered.is_empty() {
                ui.add_space(8.0);
                
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for (index, suggestion) in filtered.iter().enumerate() {
                                let is_selected = state.selected_index == Some(index);
                                
                                let response = ui.horizontal(|ui| {
                                    render_suggestion(ui, suggestion, is_selected);
                                });
                                
                                if response.hovered() {
                                    state.select_index(index);
                                }
                                
                                if response.clicked() {
                                    state.query = suggestion.clone();
                                    state.show_dropdown = false;
                                    selected = true;
                                }
                            }
                        });
                    });
            }
        }
    });

    selected
}

/// Autocomplete with async suggestions
///
/// Note: This is a placeholder for async autocomplete.
/// Actual async autocomplete would require async runtime integration.
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The autocomplete state
/// * `placeholder` - Optional placeholder text
///
/// # Examples
/// ```no_run
/// use rsui::{autocomplete_async, context::RsuiContext, components::autocomplete::AutocompleteState};
///
/// let mut state = AutocompleteState::new(vec![]);
/// let selected = autocomplete_async(ui, rsui_ctx, &mut state, Some("Search..."));
/// ```
pub fn autocomplete_async(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut AutocompleteState,
    placeholder: Option<&str>,
) -> bool {
    // Placeholder for async autocomplete
    // In a real implementation, this would load suggestions asynchronously
    autocomplete(ui, rsui_ctx, state, placeholder)
}

/// Autocomplete with clear button
///
/// Autocomplete with a clear button to reset the query
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The autocomplete state
/// * `placeholder` - Optional placeholder text
///
/// # Returns
/// * Whether a suggestion was selected
///
/// # Examples
/// ```no_run
/// use rsui::{autocomplete_with_clear, context::RsuiContext, components::autocomplete::AutocompleteState};
///
/// let mut state = AutocompleteState::new(vec!["A".to_string(), "B".to_string()]);
/// let selected = autocomplete_with_clear(ui, rsui_ctx, &mut state, Some("Search..."));
/// ```
pub fn autocomplete_with_clear(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut AutocompleteState,
    placeholder: Option<&str>,
) -> bool {
    let mut selected = false;

    ui.horizontal(|ui| {
        // Input field
        let response = ui.text_edit_singleline(&mut state.query);
        
        if state.query.is_empty() {
            if let Some(p) = placeholder {
                ui.label(egui::RichText::new(p).weak().italics());
            }
        }

        // Clear button
        if !state.query.is_empty() {
            if ui.button("×").small().clicked() {
                state.query.clear();
                state.selected_index = None;
            }
        }

        // Handle keyboard navigation
        if response.has_focus() {
            if ui.input(|i| i.key_pressed(egui::Key::ArrowDown)) {
                state.select_next();
            }
            if ui.input(|i| i.key_pressed(egui::Key::ArrowUp)) {
                state.select_previous();
            }
            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if let Some(s) = state.get_selected() {
                    state.query = s.clone();
                    selected = true;
                }
            }
        }
    });

    // Show dropdown
    if !state.query.is_empty() {
        selected = autocomplete(ui, rsui_ctx, state, None);
    }

    selected
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_autocomplete_state() {
        let suggestions = vec!["Apple".to_string(), "Banana".to_string(), "Cherry".to_string()];
        let mut state = AutocompleteState::new(suggestions);
        
        assert_eq!(state.query, "");
        assert!(state.get_selected().is_none());
        
        state.select_next();
        assert_eq!(state.get_selected(), Some(&"Apple".to_string()));
        
        state.select_next();
        assert_eq!(state.get_selected(), Some(&"Banana".to_string()));
        
        state.select_previous();
        assert_eq!(state.get_selected(), Some(&"Apple".to_string()));
    }

    #[test]
    fn test_get_filtered() {
        let suggestions = vec!["Apple".to_string(), "Banana".to_string(), "Cherry".to_string()];
        let mut state = AutocompleteState::new(suggestions);
        
        state.query = "a".to_string();
        let filtered = state.get_filtered();
        assert_eq!(filtered.len(), 2); // Apple, Banana
    }

    #[test]
    fn test_select_index() {
        let suggestions = vec!["A".to_string(), "B".to_string(), "C".to_string()];
        let mut state = AutocompleteState::new(suggestions);
        
        state.select_index(1);
        assert_eq!(state.get_selected(), Some(&"B".to_string()));
        
        state.select_index(2);
        assert_eq!(state.get_selected(), Some(&"C".to_string()));
    }
}
