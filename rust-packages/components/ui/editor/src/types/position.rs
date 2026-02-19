use serde::{Deserialize, Serialize};
use std::fmt;

/// A position in the text buffer (0-indexed)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Position {
    pub line: usize,
    pub character: usize,
}

impl Position {
    pub fn new(line: usize, character: usize) -> Self {
        Self { line, character }
    }

    pub fn zero() -> Self {
        Self { line: 0, character: 0 }
    }

    pub fn is_zero(&self) -> bool {
        self.line == 0 && self.character == 0
    }
}

impl Default for Position {
    fn default() -> Self {
        Self::zero()
    }
}

impl fmt::Display for Position {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}", self.line, self.character)
    }
}

/// A range in the text buffer
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Range {
    pub start: Position,
    pub end: Position,
}

impl Range {
    pub fn new(start: Position, end: Position) -> Self {
        Self { start, end }
    }

    pub fn from_positions(start_line: usize, start_char: usize, end_line: usize, end_char: usize) -> Self {
        Self {
            start: Position::new(start_line, start_char),
            end: Position::new(end_line, end_char),
        }
    }

    pub fn zero() -> Self {
        Self {
            start: Position::zero(),
            end: Position::zero(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.start == self.end
    }

    pub fn contains(&self, pos: Position) -> bool {
        (pos.line > self.start.line || (pos.line == self.start.line && pos.character >= self.start.character))
            && (pos.line < self.end.line || (pos.line == self.end.line && pos.character <= self.end.character))
    }

    pub fn length(&self) -> usize {
        if self.start.line == self.end.line {
            self.end.character.saturating_sub(self.start.character)
        } else {
            0
        }
    }
}

impl Default for Range {
    fn default() -> Self {
        Self::zero()
    }
}

impl fmt::Display for Range {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}-{}", self.start, self.end)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_position_creation() {
        let pos = Position::new(5, 10);
        assert_eq!(pos.line, 5);
        assert_eq!(pos.character, 10);
    }

    #[test]
    fn test_position_zero() {
        let pos = Position::zero();
        assert_eq!(pos.line, 0);
        assert_eq!(pos.character, 0);
        assert!(pos.is_zero());
    }

    #[test]
    fn test_range_creation() {
        let range = Range::new(
            Position::new(0, 0),
            Position::new(1, 5),
        );
        assert_eq!(range.start.line, 0);
        assert_eq!(range.end.line, 1);
    }

    #[test]
    fn test_range_is_empty() {
        let range = Range::zero();
        assert!(range.is_empty());
    }

    #[test]
    fn test_range_contains() {
        let range = Range::new(
            Position::new(0, 0),
            Position::new(1, 5),
        );
        assert!(range.contains(Position::new(0, 0)));
        assert!(range.contains(Position::new(0, 10)));
        assert!(range.contains(Position::new(1, 5)));
        assert!(!range.contains(Position::new(2, 0)));
    }
}
