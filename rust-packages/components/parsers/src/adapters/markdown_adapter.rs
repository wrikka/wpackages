//! Adapter for Markdown parsing library
//!
//! Wraps `pulldown-cmark` to provide a consistent interface

use pulldown_cmark::{Event, Parser, Tag, TagEnd};

/// Parse markdown content and extract events
///
/// # Arguments
/// * `content` - Markdown text content
///
/// # Returns
/// Iterator over markdown events
pub fn parse_markdown_events(content: &str) -> Parser<'_> {
    Parser::new(content)
}

/// Extract plain text from markdown content
///
/// # Arguments
/// * `content` - Markdown text content
///
/// # Returns
/// Plain text representation
pub fn extract_plain_text(content: &str) -> String {
    let parser = parse_markdown_events(content);
    let mut text = String::new();

    for event in parser {
        match event {
            Event::Text(t) => text.push_str(&t),
            Event::Code(c) => text.push_str(&c),
            Event::SoftBreak => text.push(' '),
            Event::HardBreak => text.push('\n'),
            _ => {}
        }
    }

    text
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_plain_text() {
        let md = "# Title\n\nThis is **bold** text.";
        let text = extract_plain_text(md);
        assert!(text.contains("Title"));
        assert!(text.contains("bold"));
    }

    #[test]
    fn test_extract_plain_text_code() {
        let md = "```rust\nfn main() {}\n```";
        let text = extract_plain_text(md);
        assert!(text.contains("fn main"));
    }
}
