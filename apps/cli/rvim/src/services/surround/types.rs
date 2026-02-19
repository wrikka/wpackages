#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SelectionRange {
    pub start_line: usize,
    pub start_col: usize,
    pub end_line: usize,
    pub end_col: usize,
}

impl SelectionRange {
    pub fn new(start_line: usize, start_col: usize, end_line: usize, end_col: usize) -> Self {
        Self {
            start_line,
            start_col,
            end_line,
            end_col,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SurroundPair {
    Parentheses,
    Brackets,
    Braces,
    AngleBrackets,
    Quotes,
    DoubleQuotes,
    Backticks,
}

impl SurroundPair {
    pub fn open(&self) -> char {
        match self {
            SurroundPair::Parentheses => '(',
            SurroundPair::Brackets => '[',
            SurroundPair::Braces => '{',
            SurroundPair::AngleBrackets => '<',
            SurroundPair::Quotes => '\'',
            SurroundPair::DoubleQuotes => '"',
            SurroundPair::Backticks => '`',
        }
    }

    pub fn close(&self) -> char {
        match self {
            SurroundPair::Parentheses => ')',
            SurroundPair::Brackets => ']',
            SurroundPair::Braces => '}',
            SurroundPair::AngleBrackets => '>',
            SurroundPair::Quotes => '\'',
            SurroundPair::DoubleQuotes => '"',
            SurroundPair::Backticks => '`',
        }
    }

    pub fn from_char(c: char) -> Option<Self> {
        match c {
            '(' | ')' => Some(SurroundPair::Parentheses),
            '[' | ']' => Some(SurroundPair::Brackets),
            '{' | '}' => Some(SurroundPair::Braces),
            '<' | '>' => Some(SurroundPair::AngleBrackets),
            '\'' => Some(SurroundPair::Quotes),
            '"' => Some(SurroundPair::DoubleQuotes),
            '`' => Some(SurroundPair::Backticks),
            _ => None,
        }
    }
}
