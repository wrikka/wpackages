use crate::buffer::TextBuffer;
use crate::error::BufferResult;
use crate::types::Position;

/// Bracket pair
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BracketPair {
    pub open: char,
    pub close: char,
}

impl BracketPair {
    pub fn new(open: char, close: char) -> Self {
        Self { open, close }
    }

    pub fn is_open(&self, c: char) -> bool {
        self.open == c
    }

    pub fn is_close(&self, c: char) -> bool {
        self.close == c
    }
}

/// Default bracket pairs
pub const DEFAULT_BRACKET_PAIRS: &[BracketPair] = &[
    BracketPair::new('(', ')'),
    BracketPair::new('[', ']'),
    BracketPair::new('{', '}'),
    BracketPair::new('<', '>'),
];

/// Bracket matching result
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BracketMatch {
    /// No match found
    None,
    /// Found matching bracket
    Match(Position),
    /// Unmatched bracket
    Unmatched,
}

/// Bracket matching service
#[derive(Debug, Clone)]
pub struct BracketMatcher {
    pairs: Vec<BracketPair>,
}

impl Default for BracketMatcher {
    fn default() -> Self {
        Self::new()
    }
}

impl BracketMatcher {
    pub fn new() -> Self {
        Self {
            pairs: DEFAULT_BRACKET_PAIRS.to_vec(),
        }
    }

    pub fn with_pairs(pairs: Vec<BracketPair>) -> Self {
        Self { pairs }
    }

    pub fn pairs(&self) -> &[BracketPair] {
        &self.pairs
    }

    pub fn add_pair(&mut self, pair: BracketPair) {
        self.pairs.push(pair);
    }

    /// Find matching bracket for the given position
    pub fn find_match(&self, buffer: &TextBuffer, pos: Position) -> BufferResult<BracketMatch> {
        let char = buffer.char(pos)?;

        // Check if it's an opening bracket
        for pair in &self.pairs {
            if pair.is_open(char) {
                return self.find_closing_bracket(buffer, pos, *pair);
            }
        }

        // Check if it's a closing bracket
        for pair in &self.pairs {
            if pair.is_close(char) {
                return self.find_opening_bracket(buffer, pos, *pair);
            }
        }

        Ok(BracketMatch::None)
    }

    /// Find the closing bracket for an opening bracket
    fn find_closing_bracket(&self, buffer: &TextBuffer, pos: Position, pair: BracketPair) -> BufferResult<BracketMatch> {
        let mut depth = 1;
        let mut current = pos;
        let text = buffer.to_string();
        let chars: Vec<char> = text.chars().collect();
        let char_idx = buffer.pos_to_char_idx(pos)?;

        for i in (char_idx + 1)..chars.len() {
            let c = chars[i];
            if c == pair.open {
                depth += 1;
            } else if c == pair.close {
                depth -= 1;
                if depth == 0 {
                    let match_pos = buffer.char_idx_to_pos(i)?;
                    return Ok(BracketMatch::Match(match_pos));
                }
            }
        }

        Ok(BracketMatch::Unmatched)
    }

    /// Find the opening bracket for a closing bracket
    fn find_opening_bracket(&self, buffer: &TextBuffer, pos: Position, pair: BracketPair) -> BufferResult<BracketMatch> {
        let mut depth = 1;
        let text = buffer.to_string();
        let chars: Vec<char> = text.chars().collect();
        let char_idx = buffer.pos_to_char_idx(pos)?;

        if char_idx == 0 {
            return Ok(BracketMatch::Unmatched);
        }

        for i in (0..char_idx).rev() {
            let c = chars[i];
            if c == pair.close {
                depth += 1;
            } else if c == pair.open {
                depth -= 1;
                if depth == 0 {
                    let match_pos = buffer.char_idx_to_pos(i)?;
                    return Ok(BracketMatch::Match(match_pos));
                }
            }
        }

        Ok(BracketMatch::Unmatched)
    }

    /// Get all bracket pairs in the buffer
    pub fn get_all_matches(&self, buffer: &TextBuffer) -> BufferResult<Vec<(Position, Position)>> {
        let mut matches = Vec::new();
        let text = buffer.to_string();
        let chars: Vec<char> = text.chars().collect();

        for (idx, &c) in chars.iter().enumerate() {
            // Find the pair for this character
            let pair = self.pairs.iter().find(|p| p.is_open(c) || p.is_close(c));
            if let Some(pair) = pair {
                let pos = buffer.char_idx_to_pos(idx)?;
                if let BracketMatch::Match(match_pos) = self.find_match(buffer, pos)? {
                    // Only add if the opening bracket comes before the closing
                    if pair.is_open(c) {
                        matches.push((pos, match_pos));
                    }
                }
            }
        }

        Ok(matches)
    }

    /// Check if a position is inside a bracket pair
    pub fn is_inside_pair(&self, buffer: &TextBuffer, pos: Position) -> BufferResult<bool> {
        let matches = self.get_all_matches(buffer)?;
        for (open_pos, close_pos) in matches {
            if pos.line > open_pos.line || (pos.line == open_pos.line && pos.character >= open_pos.character) {
                if pos.line < close_pos.line || (pos.line == close_pos.line && pos.character <= close_pos.character) {
                    return Ok(true);
                }
            }
        }
        Ok(false)
    }

    /// Get the enclosing bracket pair for a position
    pub fn get_enclosing_pair(&self, buffer: &TextBuffer, pos: Position) -> BufferResult<Option<(Position, Position)>> {
        let matches = self.get_all_matches(buffer)?;
        let mut best_match: Option<(Position, Position)> = None;

        for (open_pos, close_pos) in matches {
            // Check if position is inside this pair
            if pos.line > open_pos.line || (pos.line == open_pos.line && pos.character >= open_pos.character) {
                if pos.line < close_pos.line || (pos.line == close_pos.line && pos.character <= close_pos.character) {
                    // This is a valid enclosing pair
                    match best_match {
                        None => best_match = Some((open_pos, close_pos)),
                        Some((best_open, best_close)) => {
                            // Choose the innermost pair (smallest range)
                            let current_dist = (close_pos.line - open_pos.line) * 1000 + close_pos.character - open_pos.character;
                            let best_dist = (best_close.line - best_open.line) * 1000 + best_close.character - best_open.character;
                            if current_dist < best_dist {
                                best_match = Some((open_pos, close_pos));
                            }
                        }
                    }
                }
            }
        }

        Ok(best_match)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bracket_pair() {
        let pair = BracketPair::new('(', ')');
        assert!(pair.is_open('('));
        assert!(pair.is_close(')'));
        assert!(!pair.is_open(')'));
        assert!(!pair.is_close('('));
    }

    #[test]
    fn test_find_closing_bracket() {
        let buffer = TextBuffer::from_str("(hello world)");
        let matcher = BracketMatcher::new();
        let result = matcher.find_match(&buffer, Position::new(0, 0)).unwrap();
        assert_eq!(result, BracketMatch::Match(Position::new(0, 12)));
    }

    #[test]
    fn test_find_opening_bracket() {
        let buffer = TextBuffer::from_str("(hello world)");
        let matcher = BracketMatcher::new();
        let result = matcher.find_match(&buffer, Position::new(0, 12)).unwrap();
        assert_eq!(result, BracketMatch::Match(Position::new(0, 0)));
    }

    #[test]
    fn test_nested_brackets() {
        let buffer = TextBuffer::from_str("(hello (world))");
        let matcher = BracketMatcher::new();
        let result = matcher.find_match(&buffer, Position::new(0, 0)).unwrap();
        assert_eq!(result, BracketMatch::Match(Position::new(0, 14)));
    }

    #[test]
    fn test_unmatched_bracket() {
        let buffer = TextBuffer::from_str("(hello world");
        let matcher = BracketMatcher::new();
        let result = matcher.find_match(&buffer, Position::new(0, 0)).unwrap();
        assert_eq!(result, BracketMatch::Unmatched);
    }

    #[test]
    fn test_get_all_matches() {
        let buffer = TextBuffer::from_str("(hello) [world]");
        let matcher = BracketMatcher::new();
        let matches = matcher.get_all_matches(&buffer).unwrap();
        assert_eq!(matches.len(), 2);
    }
}
