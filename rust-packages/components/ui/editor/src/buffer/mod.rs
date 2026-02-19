use crate::error::{BufferError, BufferResult};
use crate::types::{Position, Range};
use ropey::Rope;
use std::ops::Range as StdRange;

/// Text buffer using rope data structure for efficient editing
#[derive(Debug, Clone)]
pub struct TextBuffer {
    rope: Rope,
}

impl TextBuffer {
    pub fn new() -> Self {
        Self {
            rope: Rope::new(),
        }
    }

    pub fn from_str(text: &str) -> Self {
        Self {
            rope: Rope::from_str(text),
        }
    }

    pub fn len(&self) -> usize {
        self.rope.len_chars()
    }

    pub fn is_empty(&self) -> bool {
        self.rope.is_empty()
    }

    pub fn line_count(&self) -> usize {
        self.rope.len_lines()
    }

    pub fn line_len(&self, line_idx: usize) -> BufferResult<usize> {
        if line_idx >= self.line_count() {
            return Err(BufferError::LineOutOfBounds(line_idx));
        }
        Ok(self.rope.line(line_idx).len_chars())
    }

    pub fn line(&self, line_idx: usize) -> BufferResult<String> {
        if line_idx >= self.line_count() {
            return Err(BufferError::LineOutOfBounds(line_idx));
        }
        Ok(self.rope.line(line_idx).to_string())
    }

    pub fn char(&self, pos: Position) -> BufferResult<char> {
        self.validate_position(pos)?;
        let char_idx = self.pos_to_char_idx(pos)?;
        Ok(self.rope.char(char_idx))
    }

    pub fn slice(&self, range: Range) -> BufferResult<String> {
        let start = self.pos_to_char_idx(range.start)?;
        let end = self.pos_to_char_idx(range.end)?;
        Ok(self.rope.slice(StdRange { start, end }).to_string())
    }

    pub fn insert(&mut self, pos: Position, text: &str) -> BufferResult<()> {
        self.validate_position(pos)?;
        let char_idx = self.pos_to_char_idx(pos)?;
        self.rope.insert(char_idx, text);
        Ok(())
    }

    pub fn remove(&mut self, range: Range) -> BufferResult<String> {
        let start = self.pos_to_char_idx(range.start)?;
        let end = self.pos_to_char_idx(range.end)?;
        let removed = self.rope.slice(StdRange { start, end }).to_string();
        self.rope.remove(StdRange { start, end });
        Ok(removed)
    }

    pub fn replace(&mut self, range: Range, text: &str) -> BufferResult<String> {
        let removed = self.remove(range)?;
        self.insert(range.start, text)?;
        Ok(removed)
    }

    pub fn to_string(&self) -> String {
        self.rope.to_string()
    }

    pub fn snapshot(&self) -> Self {
        Self {
            rope: self.rope.clone(),
        }
    }

    fn validate_position(&self, pos: Position) -> BufferResult<()> {
        if pos.line >= self.line_count() {
            return Err(BufferError::LineOutOfBounds(pos.line));
        }
        let line_len = self.line_len(pos.line)?;
        if pos.character > line_len {
            return Err(BufferError::CharOutOfBounds(pos.line, pos.character));
        }
        Ok(())
    }

    fn pos_to_char_idx(&self, pos: Position) -> BufferResult<usize> {
        self.validate_position(pos)?;
        let line_start = self.rope.line_to_char(pos.line);
        Ok(line_start + pos.character)
    }

    pub fn char_idx_to_pos(&self, char_idx: usize) -> BufferResult<Position> {
        if char_idx > self.len() {
            return Err(BufferError::OutOfBounds);
        }
        let line = self.rope.char_to_line(char_idx);
        let line_start = self.rope.line_to_char(line);
        let character = char_idx - line_start;
        Ok(Position::new(line, character))
    }
}

impl Default for TextBuffer {
    fn default() -> Self {
        Self::new()
    }
}

impl From<String> for TextBuffer {
    fn from(s: String) -> Self {
        Self::from_str(&s)
    }
}

impl From<&str> for TextBuffer {
    fn from(s: &str) -> Self {
        Self::from_str(s)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_buffer() {
        let buffer = TextBuffer::new();
        assert!(buffer.is_empty());
        assert_eq!(buffer.len(), 0);
        assert_eq!(buffer.line_count(), 1);
    }

    #[test]
    fn test_from_string() {
        let buffer = TextBuffer::from_str("Hello\nWorld");
        assert_eq!(buffer.len(), 11);
        assert_eq!(buffer.line_count(), 2);
    }

    #[test]
    fn test_insert() {
        let mut buffer = TextBuffer::new();
        buffer.insert(Position::zero(), "Hello").unwrap();
        assert_eq!(buffer.to_string(), "Hello");
        assert_eq!(buffer.len(), 5);
    }

    #[test]
    fn test_insert_multiline() {
        let mut buffer = TextBuffer::new();
        buffer.insert(Position::zero(), "Hello\nWorld").unwrap();
        assert_eq!(buffer.line_count(), 2);
        assert_eq!(buffer.line(0).unwrap(), "Hello");
        assert_eq!(buffer.line(1).unwrap(), "World");
    }

    #[test]
    fn test_remove() {
        let mut buffer = TextBuffer::from_str("Hello World");
        let range = Range::from_positions(0, 5, 0, 6);
        let removed = buffer.remove(range).unwrap();
        assert_eq!(removed, " ");
        assert_eq!(buffer.to_string(), "HelloWorld");
    }

    #[test]
    fn test_replace() {
        let mut buffer = TextBuffer::from_str("Hello World");
        let range = Range::from_positions(0, 6, 0, 11);
        let removed = buffer.replace(range, "Rust").unwrap();
        assert_eq!(removed, "World");
        assert_eq!(buffer.to_string(), "Hello Rust");
    }

    #[test]
    fn test_char_idx_to_pos() {
        let buffer = TextBuffer::from_str("Hello\nWorld");
        let pos = buffer.char_idx_to_pos(7).unwrap();
        assert_eq!(pos, Position::new(1, 1));
    }

    #[test]
    fn test_snapshot() {
        let mut buffer = TextBuffer::from_str("Hello");
        let snapshot = buffer.snapshot();
        buffer.insert(Position::new(0, 5), " World").unwrap();
        assert_eq!(snapshot.to_string(), "Hello");
        assert_eq!(buffer.to_string(), "Hello World");
    }
}
