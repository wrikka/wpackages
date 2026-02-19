use crate::context::RsuiContext;
use eframe::egui::{self, Ui};
use std::collections::HashSet;

/// Multi-select state
#[derive(Debug, Clone)]
pub struct MultiSelectState {
    pub selected: HashSet<String>,
    pub available: Vec<String>,
    pub search_query: String,
    pub show_dropdown: bool,
}

impl Default for MultiSelectState {
    fn default() -> Self {
        Self {
            selected: HashSet::new(),
            available: Vec::new(),
            search_query: String::new(),
            show_dropdown: false,
        }
    }
}

impl MultiSelectState {
    pub fn new(available: Vec<String>) -> Self {
        Self {
            selected: HashSet::new(),
            available,
            search_query: String::new(),
            show_dropdown: false,
        }
    }

    pub fn toggle(&mut self, item: &str) {
        if self.selected.contains(item) {
            self.selected.remove(item);
        } else {
            self.selected.insert(item.to_string());
        }
    }

    pub fn select(&mut self, item: &str) {
        self.selected.insert(item.to_string());
    }

    pub fn deselect(&mut self, item: &str) {
        self.selected.remove(item);
    }

    pub fn select_all(&mut self) {
        self.selected = self.available.iter().cloned().collect();
    }

    pub fn deselect_all(&mut self) {
        self.selected.clear();
    }

    pub fn is_selected(&self, item: &str) -> bool {
        self.selected.contains(item)
    }

    pub fn selected_count(&self) -> usize {
        self.selected.len()
    }

    pub fn get_selected(&self) -> Vec<String> {
        self.selected.iter().cloned().collect()
    }

    pub fn get_filtered(&self) -> Vec<&String> {
        if self.search_query.is_empty() {
            self.available.iter().collect()
        } else {
            self.available
                .iter()
                .filter(|item| item.to_lowercase().contains(&self.search_query.to_lowercase()))
                .collect()
        }
    }
}

/// Multi-select widget
///
/// Select multiple items with chips
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The multi-select state
/// * `label` - Optional label for the multi-select
///
/// # Examples
/// ```no_run
/// use rsui::{multi_select, context::RsuiContext, components::multi_select::MultiSelectState};
///
/// let available = vec!["Apple".to_string(), "Banana".to_string(), "Cherry".to_string()];
/// let mut state = MultiSelectState::new(available);
/// multi_select(ui, rsui_ctx, &mut state, Some("Select fruits"));
/// ```
pub fn multi_select(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut MultiSelectState,
    label: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        // Label
        if let Some(l) = label {
            ui.label(egui::RichText::new(l).size(14.0).color(theme.foreground));
            ui.add_space(8.0);
        }

        // Selected chips
        ui.horizontal_wrapped(|ui| {
            for item in state.get_selected() {
                let mut should_remove = false;
                
                ui.horizontal(|ui| {
                    ui.label(&item);
                    if ui.button("×").small().clicked() {
                        state.deselect(&item);
                    }
                });
            }
        });

        ui.add_space(8.0);

        // Search input
        let response = ui.text_edit_singleline(&mut state.search_query);
        if response.lost_focus() {
            state.show_dropdown = false;
        }

        // Dropdown
        if state.show_dropdown || !state.search_query.is_empty() {
            ui.add_space(8.0);
            
            egui::Frame::none()
                .fill(theme.card)
                .stroke(egui::Stroke::new(1.0, theme.border))
                .rounding(theme.radius)
                .show(ui, |ui| {
                    ui.vertical(|ui| {
                        let filtered = state.get_filtered();
                        
                        if filtered.is_empty() {
                            ui.label("No results");
                        } else {
                            for item in filtered {
                                let is_selected = state.is_selected(item);
                                
                                ui.horizontal(|ui| {
                                    let mut checked = is_selected;
                                    if ui.checkbox(&mut checked, "").changed() {
                                        state.toggle(item);
                                    }
                                    ui.label(item);
                                });
                            }
                        }
                    });
                });
        }
    });
}

/// Compact multi-select widget
///
/// Smaller version for limited space
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The multi-select state
///
/// # Examples
/// ```no_run
/// use rsui::{multi_select_compact, context::RsuiContext, components::multi_select::MultiSelectState};
///
/// let available = vec!["A".to_string(), "B".to_string(), "C".to_string()];
/// let mut state = MultiSelectState::new(available);
/// multi_select_compact(ui, rsui_ctx, &mut state);
/// ```
pub fn multi_select_compact(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut MultiSelectState,
) {
    let theme = &rsui_ctx.theme;

    ui.horizontal(|ui| {
        // Selected count
        let count = state.selected_count();
        ui.label(format!("{} selected", count));

        ui.add_space(8.0);

        // Select all / Deselect all buttons
        if count > 0 && count < state.available.len() {
            if ui.button("Select All").small().clicked() {
                state.select_all();
            }
        } else if count == state.available.len() {
            if ui.button("Deselect All").small().clicked() {
                state.deselect_all();
            }
        }
    });
}

/// Multi-select with custom item renderer
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The multi-select state
/// * `render_item` - Custom item renderer
///
/// # Examples
/// ```no_run
/// use rsui::{multi_select_with_renderer, context::RsuiContext, components::multi_select::MultiSelectState};
///
/// let available = vec!["A".to_string(), "B".to_string()];
/// let mut state = MultiSelectState::new(available);
/// multi_select_with_renderer(ui, rsui_ctx, &mut state, |ui, item, is_selected| {
///     ui.label(format!("{} - {}", if is_selected { "✓" } else { "" }, item));
/// });
/// ```
pub fn multi_select_with_renderer(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut MultiSelectState,
    render_item: impl Fn(&mut Ui, &str, bool),
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        // Selected items
        ui.horizontal_wrapped(|ui| {
            for item in state.get_selected() {
                ui.horizontal(|ui| {
                    render_item(ui, &item, true);
                    if ui.button("×").small().clicked() {
                        state.deselect(&item);
                    }
                });
            }
        });

        ui.add_space(8.0);

        // Available items
        egui::Frame::none()
            .fill(theme.card)
            .stroke(egui::Stroke::new(1.0, theme.border))
            .rounding(theme.radius)
            .show(ui, |ui| {
                ui.vertical(|ui| {
                    for item in &state.available {
                        let is_selected = state.is_selected(item);
                        
                        ui.horizontal(|ui| {
                            render_item(ui, item, is_selected);
                            
                            let mut checked = is_selected;
                            if ui.checkbox(&mut checked, "").changed() {
                                state.toggle(item);
                            }
                        });
                    }
                });
            });
    });
}

/// Multi-select with search
///
/// Multi-select with integrated search functionality
///
/// # Arguments
/// * `ui` - The UI context
/// * `rsui_ctx` - The rsui context
/// * `state` - The multi-select state
/// * `placeholder` - Optional placeholder for search input
///
/// # Examples
/// ```no_run
/// use rsui::{multi_select_search, context::RsuiContext, components::multi_select::MultiSelectState};
///
/// let available = vec!["Apple".to_string(), "Banana".to_string()];
/// let mut state = MultiSelectState::new(available);
/// multi_select_search(ui, rsui_ctx, &mut state, Some("Search..."));
/// ```
pub fn multi_select_search(
    ui: &mut Ui,
    rsui_ctx: &RsuiContext,
    state: &mut MultiSelectState,
    placeholder: Option<&str>,
) {
    let theme = &rsui_ctx.theme;

    ui.vertical(|ui| {
        // Search input
        let search_placeholder = placeholder.unwrap_or("Search...");
        let response = ui.text_edit_singleline(&mut state.search_query);
        
        if state.search_query.is_empty() {
            ui.label(egui::RichText::new(search_placeholder).weak().italics());
        }

        if response.lost_focus() {
            state.show_dropdown = false;
        }

        ui.add_space(8.0);

        // Show dropdown if searching
        if !state.search_query.is_empty() {
            let filtered = state.get_filtered();
            
            if filtered.is_empty() {
                ui.label("No results found");
            } else {
                egui::Frame::none()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .rounding(theme.radius)
                    .show(ui, |ui| {
                        ui.vertical(|ui| {
                            for item in filtered {
                                let is_selected = state.is_selected(item);
                                
                                ui.horizontal(|ui| {
                                    let mut checked = is_selected;
                                    if ui.checkbox(&mut checked, "").changed() {
                                        state.toggle(item);
                                    }
                                    ui.label(item);
                                });
                            }
                        });
                    });
            }
        }

        ui.add_space(8.0);

        // Selected chips
        ui.horizontal_wrapped(|ui| {
            for item in state.get_selected() {
                ui.horizontal(|ui| {
                    ui.label(item);
                    if ui.button("×").small().clicked() {
                        state.deselect(&item);
                    }
                });
            }
        });
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multi_select_state() {
        let available = vec!["A".to_string(), "B".to_string(), "C".to_string()];
        let mut state = MultiSelectState::new(available);
        
        assert_eq!(state.selected_count(), 0);
        
        state.select("A");
        assert_eq!(state.selected_count(), 1);
        assert!(state.is_selected("A"));
        
        state.toggle("A");
        assert_eq!(state.selected_count(), 0);
        
        state.select_all();
        assert_eq!(state.selected_count(), 3);
        
        state.deselect_all();
        assert_eq!(state.selected_count(), 0);
    }

    #[test]
    fn test_get_selected() {
        let available = vec!["A".to_string(), "B".to_string()];
        let mut state = MultiSelectState::new(available);
        
        state.select("A");
        state.select("B");
        
        let selected = state.get_selected();
        assert_eq!(selected.len(), 2);
        assert!(selected.contains(&"A".to_string()));
        assert!(selected.contains(&"B".to_string()));
    }

    #[test]
    fn test_get_filtered() {
        let available = vec!["Apple".to_string(), "Banana".to_string(), "Cherry".to_string()];
        let mut state = MultiSelectState::new(available);
        
        state.search_query = "a".to_string();
        let filtered = state.get_filtered();
        assert_eq!(filtered.len(), 2); // Apple, Banana
    }
}
