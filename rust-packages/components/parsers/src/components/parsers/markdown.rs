use crate::error::{ParseError, ParseResult};
use crate::types::{DocumentFormat, ParseOptions, ParsedDocument};
use pulldown_cmark::{Event, Parser, Tag, TagEnd};

pub fn parse_markdown(content: &str, options: &ParseOptions) -> ParseResult<ParsedDocument> {
    if content.trim().is_empty() {
        return Err(ParseError::EmptyDocument);
    }

    let parser = Parser::new(content);
    let mut plain_text = String::new();
    let mut sections = Vec::new();
    let mut current_section = String::new();
    let mut current_title: Option<String> = None;
    let mut current_level: Option<usize> = None;

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                if !current_section.is_empty() {
                    sections.push(crate::types::DocumentSection {
                        title: current_title.take(),
                        content: current_section.clone(),
                        level: current_level.take(),
                        metadata: None,
                    });
                    current_section.clear();
                }
                current_level = Some(level as usize);
            }
            Event::End(TagEnd::Heading(_)) => {
                current_title = Some(plain_text.trim().to_string());
                plain_text.clear();
            }
            Event::Text(text) => {
                plain_text.push_str(&text);
                current_section.push_str(&text);
            }
            Event::Code(code) => {
                if options.include_code_blocks {
                    plain_text.push_str(&code);
                    current_section.push_str(&code);
                }
            }
            Event::SoftBreak | Event::HardBreak => {
                plain_text.push(' ');
                current_section.push('\n');
            }
            _ => {}
        }
    }

    if !current_section.is_empty() {
        sections.push(crate::types::DocumentSection {
            title: current_title,
            content: current_section,
            level: current_level,
            metadata: None,
        });
    }

    let word_count = plain_text.split_whitespace().count();
    let char_count = plain_text.chars().count();

    Ok(ParsedDocument {
        content: plain_text,
        metadata: crate::types::DocumentMetadata {
            format: DocumentFormat::Markdown,
            title: sections.first().and_then(|s| s.title.clone()),
            author: None,
            created_date: None,
            modified_date: None,
            language: None,
            page_count: None,
            word_count,
            char_count,
        },
        sections: if options.extract_sections {
            sections
        } else {
            Vec::new()
        },
    })
}

pub fn parse_markdown_file(
    path: &std::path::Path,
    options: &ParseOptions,
) -> ParseResult<ParsedDocument> {
    let content = std::fs::read_to_string(path)?;
    parse_markdown(&content, options)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_markdown() {
        let md = "# Title\n\nThis is content.";
        let result = parse_markdown(md, &ParseOptions::default()).unwrap();
        assert_eq!(result.metadata.format, DocumentFormat::Markdown);
        assert!(!result.content.is_empty());
    }
}
