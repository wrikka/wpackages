use crate::components::multi_cursor::{Cursor, CursorManager, CursorPosition};
use crate::components::cursor_selection::{Selection, SelectionManager, SelectionMode};
use serde::{Deserialize, Serialize};

/// Multi-cursor operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CursorOperation {
    /// Move cursors
    Move {
        line_delta: isize,
        column_delta: isize,
        max_line: usize,
        max_column: usize,
    },
    /// Insert text at all cursor positions
    Insert {
        text: String,
    },
    /// Delete text at all cursor positions
    Delete {
        length: usize,
    },
    /// Delete selected text
    DeleteSelection,
    /// Select word at all cursor positions
    SelectWord {
        text: String,
    },
    /// Select line at all cursor positions
    SelectLine {
        text: String,
    },
    /// Select all occurrences of word
    SelectAllOccurrences {
        text: String,
    },
    /// Select using regex
    SelectRegex {
        pattern: String,
        text: String,
    },
    /// Clear all selections
    ClearSelections,
    /// Merge overlapping selections
    MergeSelections,
    /// Sort cursors
    SortCursors,
    /// Deduplicate cursors
    DeduplicateCursors,
    /// Set primary cursor
    SetPrimaryCursor {
        index: usize,
    },
    /// Remove cursor
    RemoveCursor {
        index: usize,
    },
}

/// Multi-cursor operations manager
#[derive(Debug, Clone)]
pub struct MultiCursorOperations {
    cursor_manager: CursorManager,
    selection_manager: SelectionManager,
}

impl MultiCursorOperations {
    pub fn new() -> Self {
        Self {
            cursor_manager: CursorManager::new(),
            selection_manager: SelectionManager::new(),
        }
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            cursor_manager: CursorManager::with_capacity(capacity),
            selection_manager: SelectionManager::new(),
        }
    }

    pub fn cursor_manager(&self) -> &CursorManager {
        &self.cursor_manager
    }

    pub fn cursor_manager_mut(&mut self) -> &mut CursorManager {
        &mut self.cursor_manager
    }

    pub fn selection_manager(&self) -> &SelectionManager {
        &self.selection_manager
    }

    pub fn selection_manager_mut(&mut self) -> &mut SelectionManager {
        &mut self.selection_manager
    }

    /// Execute a cursor operation
    pub fn execute(&mut self, operation: CursorOperation) -> MultiCursorResult<()> {
        match operation {
            CursorOperation::Move {
                line_delta,
                column_delta,
                max_line,
                max_column,
            } => {
                self.cursor_manager.move_all_cursors(line_delta, column_delta, max_line, max_column)?;
            }
            CursorOperation::Insert { text } => {
                self.insert_text(&text)?;
            }
            CursorOperation::Delete { length } => {
                self.delete_text(length)?;
            }
            CursorOperation::DeleteSelection => {
                self.delete_selection()?;
            }
            CursorOperation::SelectWord { text } => {
                self.select_words(&text)?;
            }
            CursorOperation::SelectLine { text } => {
                self.select_lines(&text)?;
            }
            CursorOperation::SelectAllOccurrences { text } => {
                self.select_all_occurrences(&text)?;
            }
            CursorOperation::SelectRegex { pattern, text } => {
                self.select_by_regex(&pattern, &text)?;
            }
            CursorOperation::ClearSelections => {
                self.clear_selections();
            }
            CursorOperation::MergeSelections => {
                self.merge_selections();
            }
            CursorOperation::SortCursors => {
                self.sort_cursors();
            }
            CursorOperation::DeduplicateCursors => {
                self.deduplicate_cursors();
            }
            CursorOperation::SetPrimaryCursor { index } => {
                self.cursor_manager.set_primary_cursor(index)?;
            }
            CursorOperation::RemoveCursor { index } => {
                self.cursor_manager.remove_cursor(index)?;
            }
        }

        Ok(())
    }

    /// Insert text at all cursor positions
    fn insert_text(&mut self, text: &str) -> MultiCursorResult<()> {
        for cursor in self.cursor_manager.cursors_mut() {
            // Insert text at cursor position
            // This would typically be handled by the editor
            // For now, just move the cursor
            cursor.position.column += text.len();
        }

        Ok(())
    }

    /// Delete text at all cursor positions
    fn delete_text(&mut self, length: usize) -> MultiCursorResult<()> {
        for cursor in self.cursor_manager.cursors_mut() {
            // Delete text at cursor position
            // This would typically be handled by the editor
            // For now, just move the cursor back
            cursor.position.column = cursor.position.column.saturating_sub(length);
        }

        Ok(())
    }

    /// Delete selected text
    fn delete_selection(&mut self) -> MultiCursorResult<()> {
        for cursor in self.cursor_manager.cursors_mut() {
            if let Some(selection) = cursor.get_selection() {
                // Move cursor to selection start
                cursor.position = selection.start;
                cursor.clear_selection();
            }
        }

        Ok(())
    }

    /// Select word at all cursor positions
    fn select_words(&mut self, text: &str) -> MultiCursorResult<()> {
        for cursor in self.cursor_manager.cursors() {
            let selection = self.selection_manager.select_word_at(text, cursor.position)?;
            cursor.selection = Some(selection);
        }

        Ok(())
    }

    /// Select line at all cursor positions
    fn select_lines(&mut self, text: &str) -> MultiCursorResult<()> {
        for cursor in self.cursor_manager.cursors() {
            let selection = self.selection_manager.select_line_at(text, cursor.position)?;
            cursor.selection = Some(selection);
        }

        Ok(())
    }

    /// Select all occurrences of word at all cursor positions
    fn select_all_occurrences(&mut self, text: &str) -> MultiCursorResult<()> {
        if let Some(primary_cursor) = self.cursor_manager.get_primary_cursor() {
            self.selection_manager.select_all_occurrences(text, primary_cursor.position)?;
        }

        Ok(())
    }

    /// Select using regex pattern
    fn select_by_regex(&mut self, pattern: &str, text: &str) -> MultiCursorResult<()> {
        self.selection_manager.select_by_regex(text, pattern)?;
        Ok(())
    }

    /// Clear all selections
    fn clear_selections(&mut self) {
        for cursor in self.cursor_manager.cursors_mut() {
            cursor.clear_selection();
        }
        self.selection_manager.clear();
    }

    /// Merge overlapping selections
    fn merge_selections(&mut self) {
        self.selection_manager.merge_overlapping();
        self.cursor_manager.merge_overlapping_selections();
    }

    /// Sort cursors
    fn sort_cursors(&mut self) {
        self.cursor_manager.sort();
    }

    /// Deduplicate cursors
    fn deduplicate_cursors(&mut self) {
        self.cursor_manager.dedup();
    }

    /// Add cursor at position
    pub fn add_cursor(&mut self, position: CursorPosition) {
        let cursor = Cursor::new(position);
        self.cursor_manager.add_cursor(cursor);
    }

    /// Add cursor with selection
    pub fn add_cursor_with_selection(&mut self, position: CursorPosition, selection: Selection) {
        let cursor = Cursor::new(position).with_selection(selection);
        self.cursor_manager.add_cursor(cursor);
    }

    /// Remove cursor at position
    pub fn remove_cursor_at(&mut self, position: CursorPosition) -> MultiCursorResult<()> {
        let index = self
            .cursor_manager
            .cursors()
            .iter()
            .position(|c| c.position == position)
            .ok_or_else(|| MultiCursorError::InvalidPosition("Cursor not found".to_string()))?;

        self.cursor_manager.remove_cursor(index)?;
        Ok(())
    }

    /// Get all cursor positions
    pub fn cursor_positions(&self) -> Vec<CursorPosition> {
        self.cursor_manager
            .cursors()
            .iter()
            .map(|c| c.position)
            .collect()
    }

    /// Get all selections
    pub fn selections(&self) -> Vec<Selection> {
        self.cursor_manager
            .cursors()
            .iter()
            .filter_map(|c| c.get_selection())
            .collect()
    }

    /// Get selected text
    pub fn selected_text(&self, text: &str) -> Vec<String> {
        self.selection_manager.get_selected_text(text)
    }

    /// Check if there are any cursors
    pub fn has_cursors(&self) -> bool {
        !self.cursor_manager.is_empty()
    }

    /// Check if there are any selections
    pub fn has_selections(&self) -> bool {
        self.cursor_manager.cursors().iter().any(|c| c.is_selection())
    }

    /// Get cursor count
    pub fn cursor_count(&self) -> usize {
        self.cursor_manager.cursor_count()
    }

    /// Get selection count
    pub fn selection_count(&self) -> usize {
        self.selections().len()
    }

    /// Clear all cursors and selections
    pub fn clear(&mut self) {
        self.cursor_manager.clear();
        self.selection_manager.clear();
    }

    /// Clone cursors from another manager
    pub fn clone_from(&mut self, other: &MultiCursorOperations) {
        self.cursor_manager = other.cursor_manager.clone();
        self.selection_manager = other.selection_manager.clone();
    }
}

impl Default for MultiCursorOperations {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_text() {
        let mut ops = MultiCursorOperations::new();
        ops.add_cursor(CursorPosition::new(0, 0));

        ops.execute(CursorOperation::Insert {
            text: "hello".to_string(),
        })
        .unwrap();

        assert_eq!(ops.cursor_positions()[0].column, 5);
    }

    #[test]
    fn test_delete_text() {
        let mut ops = MultiCursorOperations::new();
        ops.add_cursor(CursorPosition::new(0, 10));

        ops.execute(CursorOperation::Delete { length: 5 }).unwrap();

        assert_eq!(ops.cursor_positions()[0].column, 5);
    }

    #[test]
    fn test_select_word() {
        let mut ops = MultiCursorOperations::new();
        ops.add_cursor(CursorPosition::new(0, 0));

        let text = "hello world";
        ops.execute(CursorOperation::SelectWord {
            text: text.to_string(),
        })
        .unwrap();

        assert!(ops.has_selections());
    }

    #[test]
    fn test_sort_cursors() {
        let mut ops = MultiCursorOperations::new();
        ops.add_cursor(CursorPosition::new(2, 0));
        ops.add_cursor(CursorPosition::new(0, 0));
        ops.add_cursor(CursorPosition::new(1, 0));

        ops.execute(CursorOperation::SortCursors).unwrap();

        let positions = ops.cursor_positions();
        assert_eq!(positions[0].line, 0);
        assert_eq!(positions[1].line, 1);
        assert_eq!(positions[2].line, 2);
    }

    #[test]
    fn test_deduplicate_cursors() {
        let mut ops = MultiCursorOperations::new();
        ops.add_cursor(CursorPosition::new(0, 0));
        ops.add_cursor(CursorPosition::new(0, 0));
        ops.add_cursor(CursorPosition::new(1, 0));

        ops.execute(CursorOperation::DeduplicateCursors).unwrap();

        assert_eq!(ops.cursor_count(), 2);
    }
}
