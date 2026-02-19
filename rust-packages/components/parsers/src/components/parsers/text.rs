use crate::error::{ParseError, ParseResult};
use crate::types::{DocumentFormat, ParseOptions, ParsedDocument};
use encoding_rs::UTF_8;

pub fn parse_text(content: &[u8], options: &ParseOptions) -> ParseResult<ParsedDocument> {
    let text = String::from_utf8(content.to_vec())
        .or_else(|_| Ok(UTF_8.decode(content).0.to_string()))
        .map_err(|e: std::string::FromUtf8Error| {
            ParseError::Encoding(format!("Failed to decode text: {}", e))
        })?;

    if text.trim().is_empty() {
        return Err(ParseError::EmptyDocument);
    }

    let word_count = text.split_whitespace().count();
    let char_count = text.chars().count();

    Ok(ParsedDocument {
        content: text.clone(),
        metadata: crate::types::DocumentMetadata {
            format: DocumentFormat::Text,
            title: None,
            author: None,
            created_date: None,
            modified_date: None,
            language: None,
            page_count: None,
            word_count,
            char_count,
        },
        sections: if options.extract_sections {
            extract_sections_from_text(&text)
        } else {
            Vec::new()
        },
    })
}

pub fn parse_text_file(
    path: &std::path::Path,
    options: &ParseOptions,
) -> ParseResult<ParsedDocument> {
    let content = std::fs::read(path)?;
    parse_text(&content, options)
}

fn extract_sections_from_text(text: &str) -> Vec<crate::types::DocumentSection> {
    let mut sections = Vec::new();
    let lines: Vec<&str> = text.lines().collect();
    let mut current_section = String::new();
    let mut current_title: Option<String> = None;

    for line in lines {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            if !current_section.is_empty() {
                sections.push(crate::types::DocumentSection {
                    title: current_title.take(),
                    content: current_section.clone(),
                    level: None,
                    metadata: None,
                });
                current_section.clear();
            }
        } else if trimmed.len() < 100 {
            if !current_section.is_empty() {
                sections.push(crate::types::DocumentSection {
                    title: current_title.take(),
                    content: current_section.clone(),
                    level: None,
                    metadata: None,
                });
                current_section.clear();
            }
            current_title = Some(trimmed.to_string());
        } else {
            current_section.push_str(line);
            current_section.push('\n');
        }
    }

    if !current_section.is_empty() {
        sections.push(crate::types::DocumentSection {
            title: current_title,
            content: current_section,
            level: None,
            metadata: None,
        });
    }

    sections
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_text() {
        let text = b"Hello world\n\nThis is a test.";
        let result = parse_text(text, &ParseOptions::default()).unwrap();
        assert_eq!(result.metadata.format, DocumentFormat::Text);
        assert_eq!(result.metadata.word_count, 6);
    }
}
