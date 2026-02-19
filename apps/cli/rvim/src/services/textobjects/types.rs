#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TextObject {
    Word,
    Line,
    Block,
    Function,
    Class,
    Parameter,
    Argument,
    String,
    Comment,
    Tag,
    Attribute,
}

#[derive(Debug, Clone)]
pub struct TextObjectRange {
    pub start_line: usize,
    pub start_col: usize,
    pub end_line: usize,
    pub end_col: usize,
}

impl TextObjectRange {
    pub fn new(start_line: usize, start_col: usize, end_line: usize, end_col: usize) -> Self {
        Self {
            start_line,
            start_col,
            end_line,
            end_col,
        }
    }
}
