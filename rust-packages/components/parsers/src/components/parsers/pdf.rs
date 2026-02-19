use crate::error::{ParseError, ParseResult};
use crate::types::{DocumentFormat, ParseOptions, ParsedDocument};
use pdf_extract::extract_text_from_mem;
use std::path::Path;

pub fn parse_pdf(content: &[u8], options: &ParseOptions) -> ParseResult<ParsedDocument> {
    let text = extract_text_from_mem(content)
        .map_err(|e| ParseError::Pdf(format!("Failed to extract text: {}", e)))?;

    if text.trim().is_empty() {
        return Err(ParseError::EmptyDocument);
    }

    let word_count = text.split_whitespace().count();
    let char_count = text.chars().count();

    Ok(ParsedDocument {
        content: text.clone(),
        metadata: crate::types::DocumentMetadata {
            format: DocumentFormat::Pdf,
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

pub fn parse_pdf_file(path: &Path, options: &ParseOptions) -> ParseResult<ParsedDocument> {
    let content = std::fs::read(path)?;
    parse_pdf(&content, options)
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
        } else if trimmed.len() < 100
            && trimmed
                .chars()
                .all(|c| c.is_alphanumeric() || c == ' ' || c == '-')
        {
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
    fn test_extract_sections() {
        let text = "Introduction\nThis is the intro.\n\nChapter 1\nThis is chapter 1.";
        let sections = extract_sections_from_text(text);
        assert_eq!(sections.len(), 2);
    }
}
