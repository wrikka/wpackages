use crate::buffer::TextBuffer;
use crate::error::BufferResult;
use crate::types::Position;

/// Indentation style
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IndentStyle {
    /// Use spaces for indentation
    Spaces(usize),
    /// Use tabs for indentation
    Tabs,
}

impl Default for IndentStyle {
    fn default() -> Self {
        Self::Spaces(4)
    }
}

impl IndentStyle {
    pub fn to_string(&self) -> String {
        match self {
            Self::Spaces(count) => " ".repeat(*count),
            Self::Tabs => "\t".to_string(),
        }
    }

    pub fn width(&self) -> usize {
        match self {
            Self::Spaces(count) => *count,
            Self::Tabs => 4,
        }
    }
}

/// Auto-indentation service
#[derive(Debug, Clone)]
pub struct IndentationService {
    style: IndentStyle,
}

impl Default for IndentationService {
    fn default() -> Self {
        Self::new()
    }
}

impl IndentationService {
    pub fn new() -> Self {
        Self {
            style: IndentStyle::default(),
        }
    }

    pub fn with_style(style: IndentStyle) -> Self {
        Self { style }
    }

    pub fn style(&self) -> IndentStyle {
        self.style
    }

    pub fn set_style(&mut self, style: IndentStyle) {
        self.style = style;
    }

    /// Calculate indentation for a new line based on the previous line
    pub fn calculate_indent(&self, buffer: &TextBuffer, line_idx: usize) -> BufferResult<String> {
        if line_idx == 0 {
            return Ok(String::new());
        }

        let prev_line = buffer.line(line_idx - 1)?;
        let indent = self.get_line_indent(&prev_line);

        // Check if previous line ends with an opening bracket
        let last_char = prev_line.chars().last().unwrap_or(' ');
        let increased = matches!(last_char, '{' | '[' | '(') || prev_line.trim_end().ends_with(':');

        // Check for closing brackets on the same line (should decrease)
        let decreased = prev_line.contains('}') || prev_line.contains(']') || prev_line.contains(')');

        let mut indent_level = indent / self.style.width();

        if increased && !decreased {
            indent_level += 1;
        } else if decreased {
            // Count closing brackets on current line
            let close_count = prev_line.chars().filter(|c| matches!(c, '}' | ']' | ')')).count();
            let open_count = prev_line.chars().filter(|c| matches!(c, '{' | '[' | '(')).count();
            if open_count < close_count {
                indent_level = indent_level.saturating_sub(close_count - open_count);
            }
        }

        Ok(self.style.to_string().repeat(indent_level))
    }

    /// Get the indentation level of a line
    pub fn get_line_indent(&self, line: &str) -> usize {
        line.chars().take_while(|c| c.is_whitespace()).count()
    }

    /// Auto-indent a line
    pub fn auto_indent_line(&self, buffer: &mut TextBuffer, line_idx: usize) -> BufferResult<()> {
        if line_idx >= buffer.line_count() {
            return Ok(());
        }

        let line = buffer.line(line_idx)?;
        let current_indent = self.get_line_indent(&line);
        let desired_indent_str = self.calculate_indent(buffer, line_idx)?;
        let desired_indent = desired_indent_str.len();

        if current_indent == desired_indent {
            return Ok(());
        }

        // Remove current indentation
        let range_start = Position::new(line_idx, 0);
        let range_end = Position::new(line_idx, current_indent);
        buffer.remove(crate::types::Range::new(range_start, range_end))?;

        // Add new indentation
        buffer.insert(Position::new(line_idx, 0), &desired_indent_str)?;

        Ok(())
    }

    /// Get indentation for a specific position (for new line)
    pub fn get_indent_for_position(&self, buffer: &TextBuffer, pos: Position) -> BufferResult<String> {
        self.calculate_indent(buffer, pos.line)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_indent_style_spaces() {
        let style = IndentStyle::Spaces(4);
        assert_eq!(style.to_string(), "    ");
        assert_eq!(style.width(), 4);
    }

    #[test]
    fn test_indent_style_tabs() {
        let style = IndentStyle::Tabs;
        assert_eq!(style.to_string(), "\t");
        assert_eq!(style.width(), 4);
    }

    #[test]
    fn test_get_line_indent() {
        let service = IndentationService::new();
        assert_eq!(service.get_line_indent("    hello"), 4);
        assert_eq!(service.get_line_indent("\t\thello"), 2);
        assert_eq!(service.get_line_indent("hello"), 0);
    }

    #[test]
    fn test_calculate_indent_after_open_brace() {
        let mut buffer = TextBuffer::from_str("function test() {\n");
        let service = IndentationService::new();
        let indent = service.calculate_indent(&buffer, 1).unwrap();
        assert_eq!(indent, "    ");
    }

    #[test]
    fn test_calculate_indent_after_close_brace() {
        let mut buffer = TextBuffer::from_str("    }\n");
        let service = IndentationService::new();
        let indent = service.calculate_indent(&buffer, 1).unwrap();
        assert_eq!(indent, "");
    }
}
