use crate::error::{ParseError, ParseResult};
use crate::types::{DocumentFormat, ParseOptions, ParsedDocument};
use regex::Regex;

pub fn parse_code(
    content: &str,
    language: &str,
    options: &ParseOptions,
) -> ParseResult<ParsedDocument> {
    if content.trim().is_empty() {
        return Err(ParseError::EmptyDocument);
    }

    let mut clean_content = content.to_string();

    if !options.preserve_formatting {
        clean_content = remove_comments(language, &clean_content);
    }

    let word_count = clean_content.split_whitespace().count();
    let char_count = clean_content.chars().count();

    Ok(ParsedDocument {
        content: clean_content.clone(),
        metadata: crate::types::DocumentMetadata {
            format: DocumentFormat::Code,
            title: None,
            author: None,
            created_date: None,
            modified_date: None,
            language: Some(language.to_string()),
            page_count: None,
            word_count,
            char_count,
        },
        sections: if options.extract_sections {
            extract_code_sections(&clean_content, language)
        } else {
            Vec::new()
        },
    })
}

pub fn parse_code_file(
    path: &std::path::Path,
    options: &ParseOptions,
) -> ParseResult<ParsedDocument> {
    let content = std::fs::read_to_string(path)?;
    let language = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("unknown");
    parse_code(&content, language, options)
}

fn remove_comments(language: &str, code: &str) -> String {
    match language {
        "rs" | "c" | "cpp" | "h" | "hpp" | "java" | "js" | "ts" => {
            let re = Regex::new(r"(?m)//.*$|/\*[\s\S]*?\*/").unwrap();
            re.replace_all(code, "").to_string()
        }
        "py" => {
            let re = Regex::new(r"(?m)#.*$").unwrap();
            re.replace_all(code, "").to_string()
        }
        "go" => {
            let re = Regex::new(r"(?m)//.*$|/\*[\s\S]*?\*/").unwrap();
            re.replace_all(code, "").to_string()
        }
        _ => code.to_string(),
    }
}

fn extract_code_sections(code: &str, language: &str) -> Vec<crate::types::DocumentSection> {
    let mut sections = Vec::new();

    match language {
        "rs" => extract_rust_sections(code, &mut sections),
        "py" => extract_python_sections(code, &mut sections),
        "js" | "ts" => extract_javascript_sections(code, &mut sections),
        _ => {}
    }

    if sections.is_empty() {
        sections.push(crate::types::DocumentSection {
            title: None,
            content: code.to_string(),
            level: None,
            metadata: None,
        });
    }

    sections
}

fn extract_rust_sections(code: &str, sections: &mut Vec<crate::types::DocumentSection>) {
    let fn_re = Regex::new(r"(?m)^(pub\s+)?(async\s+)?fn\s+(\w+)").unwrap();
    let struct_re = Regex::new(r"(?m)^(pub\s+)?struct\s+(\w+)").unwrap();
    let impl_re = Regex::new(r"(?m)^impl\s+(\w+)").unwrap();

    for cap in fn_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("fn {}", &cap[3])),
            content: String::new(),
            level: Some(2),
            metadata: None,
        });
    }

    for cap in struct_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("struct {}", &cap[2])),
            content: String::new(),
            level: Some(1),
            metadata: None,
        });
    }

    for cap in impl_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("impl {}", &cap[1])),
            content: String::new(),
            level: Some(1),
            metadata: None,
        });
    }
}

fn extract_python_sections(code: &str, sections: &mut Vec<crate::types::DocumentSection>) {
    let fn_re = Regex::new(r"(?m)^def\s+(\w+)").unwrap();
    let class_re = Regex::new(r"(?m)^class\s+(\w+)").unwrap();

    for cap in fn_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("def {}", &cap[1])),
            content: String::new(),
            level: Some(2),
            metadata: None,
        });
    }

    for cap in class_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("class {}", &cap[1])),
            content: String::new(),
            level: Some(1),
            metadata: None,
        });
    }
}

fn extract_javascript_sections(code: &str, sections: &mut Vec<crate::types::DocumentSection>) {
    let fn_re = Regex::new(r"(?m)^(export\s+)?(async\s+)?function\s+(\w+)").unwrap();
    let class_re = Regex::new(r"(?m)^class\s+(\w+)").unwrap();

    for cap in fn_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("function {}", &cap[3])),
            content: String::new(),
            level: Some(2),
            metadata: None,
        });
    }

    for cap in class_re.captures_iter(code) {
        sections.push(crate::types::DocumentSection {
            title: Some(format!("class {}", &cap[1])),
            content: String::new(),
            level: Some(1),
            metadata: None,
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_code() {
        let code = "fn main() {\n    println!(\"Hello\");\n}";
        let result = parse_code(code, "rs", &ParseOptions::default()).unwrap();
        assert_eq!(result.metadata.format, DocumentFormat::Code);
        assert_eq!(result.metadata.language, Some("rs".to_string()));
    }
}
