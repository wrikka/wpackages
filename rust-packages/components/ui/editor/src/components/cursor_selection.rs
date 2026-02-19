use crate::components::multi_cursor::{CursorPosition, Cursor};
use crate::error::{MultiCursorError, MultiCursorResult};
use regex::Regex;
use serde::{Deserialize, Serialize};

/// Selection mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SelectionMode {
    /// Normal selection (character-based)
    Normal,
    /// Word selection
    Word,
    /// Line selection
    Line,
    /// Block selection (column-based)
    Block,
    /// Regex-based selection
    Regex,
}

impl Default for SelectionMode {
    fn default() -> Self {
        Self::Normal
    }
}

/// Selection manager for handling selections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionManager {
    mode: SelectionMode,
    selections: Vec<Selection>,
}

impl SelectionManager {
    pub fn new() -> Self {
        Self {
            mode: SelectionMode::Normal,
            selections: Vec::new(),
        }
    }

    pub fn with_mode(mode: SelectionMode) -> Self {
        Self {
            mode,
            selections: Vec::new(),
        }
    }

    pub fn set_mode(&mut self, mode: SelectionMode) {
        self.mode = mode;
    }

    pub fn mode(&self) -> SelectionMode {
        self.mode
    }

    pub fn add_selection(&mut self, selection: Selection) {
        self.selections.push(selection);
    }

    pub fn remove_selection(&mut self, index: usize) -> MultiCursorResult<Selection> {
        if index >= self.selections.len() {
            return Err(MultiCursorError::InvalidPosition(format!(
                "Selection index {} not found",
                index
            )));
        }

        Ok(self.selections.remove(index))
    }

    pub fn get_selection(&self, index: usize) -> MultiCursorResult<&Selection> {
        self.selections
            .get(index)
            .ok_or_else(|| MultiCursorError::InvalidPosition(format!("Selection index {} not found", index)))
    }

    pub fn selection_count(&self) -> usize {
        self.selections.len()
    }

    pub fn selections(&self) -> &[Selection] {
        &self.selections
    }

    pub fn clear(&mut self) {
        self.selections.clear();
    }

    /// Select word at cursor position
    pub fn select_word_at(&mut self, text: &str, position: CursorPosition) -> MultiCursorResult<Selection> {
        let lines: Vec<&str> = text.lines().collect();

        if position.line >= lines.len() {
            return Err(MultiCursorError::OutOfBounds);
        }

        let line = lines[position.line];
        let chars: Vec<char> = line.chars().collect();

        if position.column >= chars.len() {
            return Err(MultiCursorError::OutOfBounds);
        }

        // Find word boundaries
        let mut start = position.column;
        let mut end = position.column;

        // Move left to find word start
        while start > 0 && is_word_char(chars[start - 1]) {
            start -= 1;
        }

        // Move right to find word end
        while end < chars.len() && is_word_char(chars[end]) {
            end += 1;
        }

        let selection = Selection::new(
            CursorPosition::new(position.line, start),
            CursorPosition::new(position.line, end),
        );

        self.add_selection(selection.clone());
        Ok(selection)
    }

    /// Select line at cursor position
    pub fn select_line_at(&mut self, text: &str, position: CursorPosition) -> MultiCursorResult<Selection> {
        let lines: Vec<&str> = text.lines().collect();

        if position.line >= lines.len() {
            return Err(MultiCursorError::OutOfBounds);
        }

        let line = lines[position.line];
        let line_len = line.len();

        let selection = Selection::new(
            CursorPosition::new(position.line, 0),
            CursorPosition::new(position.line, line_len),
        );

        self.add_selection(selection.clone());
        Ok(selection)
    }

    /// Select all occurrences of word at cursor
    pub fn select_all_occurrences(&mut self, text: &str, position: CursorPosition) -> MultiCursorResult<Vec<Selection>> {
        let lines: Vec<&str> = text.lines().collect();

        if position.line >= lines.len() {
            return Err(MultiCursorError::OutOfBounds);
        }

        let line = lines[position.line];
        let chars: Vec<char> = line.chars().collect();

        if position.column >= chars.len() {
            return Err(MultiCursorError::OutOfBounds);
        }

        // Find word at cursor
        let mut start = position.column;
        let mut end = position.column;

        while start > 0 && is_word_char(chars[start - 1]) {
            start -= 1;
        }

        while end < chars.len() && is_word_char(chars[end]) {
            end += 1;
        }

        let word: String = chars[start..end].iter().collect();

        if word.is_empty() {
            return Ok(Vec::new());
        }

        // Find all occurrences
        let mut selections = Vec::new();
        let word_regex = Regex::new(&format!(r"\b{}\b", regex::escape(&word)))?;

        for (line_idx, line_text) in lines.iter().enumerate() {
            for mat in word_regex.find_iter(line_text) {
                let selection = Selection::new(
                    CursorPosition::new(line_idx, mat.start()),
                    CursorPosition::new(line_idx, mat.end()),
                );
                selections.push(selection);
            }
        }

        for selection in &selections {
            self.add_selection(selection.clone());
        }

        Ok(selections)
    }

    /// Select using regex pattern
    pub fn select_by_regex(&mut self, text: &str, pattern: &str) -> MultiCursorResult<Vec<Selection>> {
        let regex = Regex::new(pattern)?;
        let mut selections = Vec::new();

        for (line_idx, line_text) in text.lines().enumerate() {
            for mat in regex.find_iter(line_text) {
                let selection = Selection::new(
                    CursorPosition::new(line_idx, mat.start()),
                    CursorPosition::new(line_idx, mat.end()),
                );
                selections.push(selection);
            }
        }

        for selection in &selections {
            self.add_selection(selection.clone());
        }

        Ok(selections)
    }

    /// Expand selection to include surrounding context
    pub fn expand_selection(&mut self, text: &str, selection: &Selection, lines: usize) -> MultiCursorResult<Selection> {
        let text_lines: Vec<&str> = text.lines().collect();

        let start_line = selection.start.line.saturating_sub(lines);
        let end_line = (selection.end.line + lines).min(text_lines.len() - 1);

        let start_column = if start_line == selection.start.line {
            selection.start.column
        } else {
            0
        };

        let end_column = if end_line == selection.end.line {
            selection.end.column
        } else {
            text_lines[end_line].len()
        };

        let expanded = Selection::new(
            CursorPosition::new(start_line, start_column),
            CursorPosition::new(end_line, end_column),
        );

        Ok(expanded)
    }

    /// Merge overlapping selections
    pub fn merge_overlapping(&mut self) {
        if self.selections.is_empty() {
            return;
        }

        self.selections.sort_by(|a, b| {
            if a.start.line != b.start.line {
                a.start.line.cmp(&b.start.line)
            } else {
                a.start.column.cmp(&b.start.column)
            }
        });

        let mut merged = Vec::new();
        let mut current = self.selections[0].clone();

        for selection in &self.selections[1..] {
            if selection.start <= current.end {
                // Overlapping, merge
                current = Selection::new(
                    current.start,
                    current.end.max(selection.end),
                );
            } else {
                merged.push(current);
                current = selection.clone();
            }
        }

        merged.push(current);
        self.selections = merged;
    }

    /// Get all selected text
    pub fn get_selected_text(&self, text: &str) -> Vec<String> {
        let lines: Vec<&str> = text.lines().collect();
        let mut selected_texts = Vec::new();

        for selection in &self.selections {
            if selection.start.line == selection.end.line {
                // Single line selection
                if selection.start.line < lines.len() {
                    let line = lines[selection.start.line];
                    let start = selection.start.column.min(line.len());
                    let end = selection.end.column.min(line.len());
                    selected_texts.push(line[start..end].to_string());
                }
            } else {
                // Multi-line selection
                let mut text = String::new();

                // First line
                if selection.start.line < lines.len() {
                    let line = lines[selection.start.line];
                    let start = selection.start.column.min(line.len());
                    text.push_str(&line[start..]);
                }

                // Middle lines
                for line_idx in (selection.start.line + 1)..selection.end.line {
                    if line_idx < lines.len() {
                        text.push('\n');
                        text.push_str(lines[line_idx]);
                    }
                }

                // Last line
                if selection.end.line < lines.len() {
                    let line = lines[selection.end.line];
                    let end = selection.end.column.min(line.len());
                    text.push('\n');
                    text.push_str(&line[..end]);
                }

                selected_texts.push(text);
            }
        }

        selected_texts
    }
}

impl Default for SelectionManager {
    fn default() -> Self {
        Self::new()
    }
}

fn is_word_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_'
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_select_word_at() {
        let mut manager = SelectionManager::new();
        let text = "hello world";
        let position = CursorPosition::new(0, 0);

        let selection = manager.select_word_at(text, position).unwrap();
        assert_eq!(selection.start.column, 0);
        assert_eq!(selection.end.column, 5);
    }

    #[test]
    fn test_select_line_at() {
        let mut manager = SelectionManager::new();
        let text = "hello world\nfoo bar";
        let position = CursorPosition::new(0, 0);

        let selection = manager.select_line_at(text, position).unwrap();
        assert_eq!(selection.start, CursorPosition::new(0, 0));
        assert_eq!(selection.end, CursorPosition::new(0, 11));
    }

    #[test]
    fn test_select_all_occurrences() {
        let mut manager = SelectionManager::new();
        let text = "hello world hello";
        let position = CursorPosition::new(0, 0);

        let selections = manager.select_all_occurrences(text, position).unwrap();
        assert_eq!(selections.len(), 2);
    }

    #[test]
    fn test_merge_overlapping() {
        let mut manager = SelectionManager::new();
        manager.add_selection(Selection::new(
            CursorPosition::new(0, 0),
            CursorPosition::new(0, 10),
        ));
        manager.add_selection(Selection::new(
            CursorPosition::new(0, 5),
            CursorPosition::new(0, 15),
        ));

        manager.merge_overlapping();
        assert_eq!(manager.selection_count(), 1);
    }
}
