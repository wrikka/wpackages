use std::vec::Vec;

#[derive(Debug, Clone)]
pub struct Item {
    pub text: String,
}

impl Item {
    pub fn new(text: String) -> Self {
        Self { text }
    }
}

#[derive(Debug, Clone)]
pub enum AppState {
    Running,
    Quit,
}

#[derive(Debug)]
pub struct State {
    pub items: Vec<Item>,
    pub selected_index: usize,
    pub filter: String,
    pub app_state: AppState,
}

impl State {
    pub fn new(items: Vec<Item>) -> Self {
        Self {
            items,
            selected_index: 0,
            filter: String::new(),
            app_state: AppState::Running,
        }
    }

    pub fn filtered_items(&self) -> Vec<&Item> {
        if self.filter.is_empty() {
            self.items.iter().collect()
        } else {
            self.items
                .iter()
                .filter(|item| item.text.to_lowercase().contains(&self.filter.to_lowercase()))
                .collect()
        }
    }

    pub fn select_next(&mut self) {
        let filtered = self.filtered_items();
        if !filtered.is_empty() {
            self.selected_index = (self.selected_index + 1).min(filtered.len() - 1);
        }
    }

    pub fn select_previous(&mut self) {
        let filtered = self.filtered_items();
        if !filtered.is_empty() {
            self.selected_index = self.selected_index.saturating_sub(1);
        }
    }

    pub fn get_selected_item(&self) -> Option<&Item> {
        let filtered = self.filtered_items();
        filtered.get(self.selected_index).copied()
    }
}
