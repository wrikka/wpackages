use super::state::EditorState;
use crate::services::multi_selection::Selection;

impl EditorState {
    pub fn select_word(&mut self) {
        let source = self.content.join("\n");
        self.context
            .multi_selection
            .select_word(self.cursor_y, self.cursor_x, &source);
    }

    pub fn select_all_occurrences(&mut self) {
        let source = self.content.join("\n");
        self.context
            .multi_selection
            .select_all_occurrences(self.cursor_y, self.cursor_x, &source);
    }

    pub fn select_line(&mut self) {
        let source = self.content.join("\n");
        self.context
            .multi_selection
            .select_line(self.cursor_y, &source);
    }

    pub fn select_all_lines(&mut self) {
        let source = self.content.join("\n");
        self.context.multi_selection.select_all_lines(&source);
    }

    pub fn expand_selection(&mut self) {
        let source = self.content.join("\n");
        self.context
            .multi_selection
            .expand_selection(self.cursor_y, self.cursor_x, &source);
    }

    pub fn shrink_selection(&mut self) {
        let source = self.content.join("\n");
        self.context
            .multi_selection
            .shrink_selection(self.cursor_y, self.cursor_x, &source);
    }

    pub fn selections(&self) -> &[Selection] {
        self.context.multi_selection.selections()
    }

    pub fn primary_selection(&self) -> Option<&Selection> {
        self.context.multi_selection.primary_selection()
    }

    pub fn clear_selections(&mut self) {
        self.context.multi_selection.clear();
    }
}
