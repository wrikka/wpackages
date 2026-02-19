use crate::error::{MultiCursorError, MultiCursorResult};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

/// Cursor position in the text
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CursorPosition {
    pub line: usize,
    pub column: usize,
}

impl CursorPosition {
    pub fn new(line: usize, column: usize) -> Self {
        Self { line, column }
    }

    pub fn zero() -> Self {
        Self { line: 0, column: 0 }
    }

    pub fn is_zero(&self) -> bool {
        self.line == 0 && self.column == 0
    }

    pub fn cmp(&self, other: &Self) -> Ordering {
        match self.line.cmp(&other.line) {
            Ordering::Equal => self.column.cmp(&other.column),
            other => other,
        }
    }

    pub fn min(&self, other: &Self) -> Self {
        if self.cmp(other) <= Ordering::Equal {
            *self
        } else {
            *other
        }
    }

    pub fn max(&self, other: &Self) -> Self {
        if self.cmp(other) >= Ordering::Equal {
            *self
        } else {
            *other
        }
    }
}

impl PartialOrd for CursorPosition {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Cursor in the text editor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cursor {
    pub position: CursorPosition,
    pub anchor: Option<CursorPosition>,
    pub selection: Option<Selection>,
}

impl Cursor {
    pub fn new(position: CursorPosition) -> Self {
        Self {
            position,
            anchor: None,
            selection: None,
        }
    }

    pub fn with_anchor(mut self, anchor: CursorPosition) -> Self {
        self.anchor = Some(anchor);
        self
    }

    pub fn with_selection(mut self, selection: Selection) -> Self {
        self.selection = Some(selection);
        self
    }

    pub fn is_selection(&self) -> bool {
        self.anchor.is_some() || self.selection.is_some()
    }

    pub fn get_selection(&self) -> Option<Selection> {
        if let Some(selection) = &self.selection {
            Some(selection.clone())
        } else if let Some(anchor) = &self.anchor {
            Some(Selection::new(*anchor, self.position))
        } else {
            None
        }
    }

    pub fn clear_selection(&mut self) {
        self.anchor = None;
        self.selection = None;
    }

    pub fn move_to(&mut self, position: CursorPosition) {
        self.position = position;
        if !self.is_selection() {
            self.clear_selection();
        }
    }

    pub fn move_line(&mut self, delta: isize, max_line: usize) -> MultiCursorResult<()> {
        let new_line = if delta >= 0 {
            self.position.line + delta as usize
        } else {
            self.position.line.saturating_sub((-delta) as usize)
        };

        if new_line > max_line {
            return Err(MultiCursorError::OutOfBounds);
        }

        self.position.line = new_line;
        Ok(())
    }

    pub fn move_column(&mut self, delta: isize, max_column: usize) -> MultiCursorResult<()> {
        let new_column = if delta >= 0 {
            self.position.column + delta as usize
        } else {
            self.position.column.saturating_sub((-delta) as usize)
        };

        if new_column > max_column {
            return Err(MultiCursorError::OutOfBounds);
        }

        self.position.column = new_column;
        Ok(())
    }
}

/// Selection range
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Selection {
    pub start: CursorPosition,
    pub end: CursorPosition,
}

impl Selection {
    pub fn new(start: CursorPosition, end: CursorPosition) -> Self {
        let (start, end) = if start.cmp(&end) <= Ordering::Equal {
            (start, end)
        } else {
            (end, start)
        };
        Self { start, end }
    }

    pub fn is_empty(&self) -> bool {
        self.start == self.end
    }

    pub fn contains(&self, position: CursorPosition) -> bool {
        position >= self.start && position <= self.end
    }

    pub fn lines(&self) -> Vec<usize> {
        (self.start.line..=self.end.line).collect()
    }

    pub fn length(&self) -> usize {
        if self.start.line == self.end.line {
            self.end.column - self.start.column
        } else {
            // Approximate length for multi-line selections
            (self.end.line - self.start.line) * 80 + self.end.column - self.start.column
        }
    }
}

/// Cursor manager for handling multiple cursors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorManager {
    cursors: Vec<Cursor>,
    primary_cursor_index: usize,
}

impl CursorManager {
    pub fn new() -> Self {
        Self {
            cursors: Vec::new(),
            primary_cursor_index: 0,
        }
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            cursors: Vec::with_capacity(capacity),
            primary_cursor_index: 0,
        }
    }

    pub fn add_cursor(&mut self, cursor: Cursor) {
        self.cursors.push(cursor);
    }

    pub fn remove_cursor(&mut self, index: usize) -> MultiCursorResult<Cursor> {
        if index >= self.cursors.len() {
            return Err(MultiCursorError::InvalidPosition(format!(
                "Cursor index {} out of bounds",
                index
            )));
        }

        let cursor = self.cursors.remove(index);

        // Adjust primary cursor index if necessary
        if index < self.primary_cursor_index {
            self.primary_cursor_index -= 1;
        } else if self.primary_cursor_index >= self.cursors.len() && !self.cursors.is_empty() {
            self.primary_cursor_index = self.cursors.len() - 1;
        }

        Ok(cursor)
    }

    pub fn get_cursor(&self, index: usize) -> MultiCursorResult<&Cursor> {
        self.cursors
            .get(index)
            .ok_or_else(|| MultiCursorError::InvalidPosition(format!("Cursor index {} not found", index)))
    }

    pub fn get_cursor_mut(&mut self, index: usize) -> MultiCursorResult<&mut Cursor> {
        self.cursors
            .get_mut(index)
            .ok_or_else(|| MultiCursorError::InvalidPosition(format!("Cursor index {} not found", index)))
    }

    pub fn get_primary_cursor(&self) -> MultiCursorResult<&Cursor> {
        self.cursors
            .get(self.primary_cursor_index)
            .ok_or_else(|| MultiCursorError::NoCursors)
    }

    pub fn get_primary_cursor_mut(&mut self) -> MultiCursorResult<&mut Cursor> {
        self.cursors
            .get_mut(self.primary_cursor_index)
            .ok_or_else(|| MultiCursorError::NoCursors)
    }

    pub fn set_primary_cursor(&mut self, index: usize) -> MultiCursorResult<()> {
        if index >= self.cursors.len() {
            return Err(MultiCursorError::InvalidPosition(format!(
                "Cursor index {} out of bounds",
                index
            )));
        }

        self.primary_cursor_index = index;
        Ok(())
    }

    pub fn cursor_count(&self) -> usize {
        self.cursors.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cursors.is_empty()
    }

    pub fn cursors(&self) -> &[Cursor] {
        &self.cursors
    }

    pub fn cursors_mut(&mut self) -> &mut [Cursor] {
        &mut self.cursors
    }

    pub fn clear(&mut self) {
        self.cursors.clear();
        self.primary_cursor_index = 0;
    }

    pub fn sort(&mut self) {
        self.cursors.sort_by(|a, b| a.position.cmp(&b.position));
    }

    pub fn dedup(&mut self) {
        let mut unique_cursors = Vec::new();
        for cursor in self.cursors.drain(..) {
            if !unique_cursors.iter().any(|c| c.position == cursor.position) {
                unique_cursors.push(cursor);
            }
        }
        self.cursors = unique_cursors;

        // Adjust primary cursor index
        if self.primary_cursor_index >= self.cursors.len() && !self.cursors.is_empty() {
            self.primary_cursor_index = self.cursors.len() - 1;
        }
    }

    pub fn merge_overlapping_selections(&mut self) {
        for cursor in &mut self.cursors {
            if let Some(selection) = cursor.get_selection() {
                cursor.selection = Some(selection);
            }
        }
    }

    pub fn move_all_cursors(&mut self, line_delta: isize, column_delta: isize, max_line: usize, max_column: usize) -> MultiCursorResult<()> {
        for cursor in &mut self.cursors {
            if line_delta != 0 {
                cursor.move_line(line_delta, max_line)?;
            }
            if column_delta != 0 {
                cursor.move_column(column_delta, max_column)?;
            }
        }
        Ok(())
    }

    pub fn move_primary_cursor(&mut self, line_delta: isize, column_delta: isize, max_line: usize, max_column: usize) -> MultiCursorResult<()> {
        let cursor = self.get_primary_cursor_mut()?;
        if line_delta != 0 {
            cursor.move_line(line_delta, max_line)?;
        }
        if column_delta != 0 {
            cursor.move_column(column_delta, max_column)?;
        }
        Ok(())
    }
}

impl Default for CursorManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cursor_position_cmp() {
        let pos1 = CursorPosition::new(0, 0);
        let pos2 = CursorPosition::new(0, 5);
        let pos3 = CursorPosition::new(1, 0);

        assert!(pos1 < pos2);
        assert!(pos2 < pos3);
        assert!(pos1 < pos3);
    }

    #[test]
    fn test_cursor_manager_add_remove() {
        let mut manager = CursorManager::new();
        let cursor = Cursor::new(CursorPosition::new(0, 0));

        manager.add_cursor(cursor.clone());
        assert_eq!(manager.cursor_count(), 1);

        let removed = manager.remove_cursor(0).unwrap();
        assert_eq!(removed.position, cursor.position);
        assert_eq!(manager.cursor_count(), 0);
    }

    #[test]
    fn test_cursor_manager_sort() {
        let mut manager = CursorManager::new();
        manager.add_cursor(Cursor::new(CursorPosition::new(2, 0)));
        manager.add_cursor(Cursor::new(CursorPosition::new(0, 0)));
        manager.add_cursor(Cursor::new(CursorPosition::new(1, 0)));

        manager.sort();

        assert_eq!(manager.cursors()[0].position.line, 0);
        assert_eq!(manager.cursors()[1].position.line, 1);
        assert_eq!(manager.cursors()[2].position.line, 2);
    }

    #[test]
    fn test_cursor_manager_dedup() {
        let mut manager = CursorManager::new();
        manager.add_cursor(Cursor::new(CursorPosition::new(0, 0)));
        manager.add_cursor(Cursor::new(CursorPosition::new(0, 0)));
        manager.add_cursor(Cursor::new(CursorPosition::new(1, 0)));

        manager.dedup();

        assert_eq!(manager.cursor_count(), 2);
    }
}
