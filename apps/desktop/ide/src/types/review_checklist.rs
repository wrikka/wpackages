use serde::{Deserialize, Serialize};
use review_checklist::{ReviewChecklist, ChecklistItem, ItemStatus, ChecklistState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewChecklistState {
    pub checklists: Vec<ReviewChecklist>,
    pub selected_checklist: Option<String>,
    pub show_completed: bool,
    pub filter_category: Option<String>,
}

impl Default for ReviewChecklistState {
    fn default() -> Self {
        Self {
            checklists: Vec::new(),
            selected_checklist: None,
            show_completed: true,
            filter_category: None,
        }
    }
}
