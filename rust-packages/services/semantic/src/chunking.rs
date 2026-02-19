use std::path::Path;
use tree_sitter::{Language, Node, Parser, Query, QueryCursor};

// Re-exporting SymbolKind and get_language from codesearch's symbol engine temporarily.
// This should be centralized in a common crate later.

fn get_language(path: &Path) -> Option<Language> {
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    match ext {
        "rs" => Some(unsafe { tree_sitter_rust() }),
        "js" | "mjs" => Some(unsafe { tree_sitter_javascript() }),
        "ts" | "mts" => Some(unsafe { tree_sitter_typescript::language_typescript() }),
        "tsx" => Some(unsafe { tree_sitter_typescript::language_tsx() }),
        "py" => Some(unsafe { tree_sitter_python() }),
        "go" => Some(unsafe { tree_sitter_go() }),
        "json" => Some(unsafe { tree_sitter_json() }),
        _ => None,
    }
}

extern "C" {
    fn tree_sitter_rust() -> Language;
    fn tree_sitter_javascript() -> Language;
    fn tree_sitter_typescript() -> Language;
    fn tree_sitter_tsx() -> Language;
    fn tree_sitter_python() -> Language;
    fn tree_sitter_go() -> Language;
    fn tree_sitter_json() -> Language;
}

fn get_chunking_queries(lang: Language) -> Vec<Query> {
    let queries = [
        "(function_item) @chunk",
        "(struct_item) @chunk",
        "(enum_item) @chunk",
        "(impl_item) @chunk",
        "(function_declaration) @chunk",
        "(class_declaration) @chunk",
        "(lexical_declaration) @chunk",
        "(function_definition) @chunk",
        "(class_definition) @chunk",
        "(method_declaration) @chunk",
        "(type_declaration) @chunk",
    ];
    queries.iter().filter_map(|q| Query::new(lang, q).ok()).collect()
}

fn chunk_text_fallback(content: &str, max_lines: usize) -> Vec<(usize, usize, String)> {
    content.lines().collect::<Vec<_>>().chunks(max_lines).enumerate().map(|(i, lines)| {
        let start = i * max_lines + 1;
        (start, start + lines.len() - 1, lines.join("\n"))
    }).collect()
}

pub fn chunk_file(path: &Path, content: &str, max_lines: usize) -> anyhow::Result<Vec<(usize, usize, String)>> {
    let Some(language) = get_language(path) else {
        return Ok(chunk_text_fallback(content, max_lines));
    };

    let mut parser = Parser::new();
    parser.set_language(language)?;
    let tree = parser.parse(content, None).unwrap();
    let mut chunks = Vec::new();
    let queries = get_chunking_queries(language);
    let mut chunked_ranges = std::collections::HashSet::new();

    for query in queries {
        let mut cursor = QueryCursor::new();
        for m in cursor.matches(&query, tree.root_node(), content.as_bytes()) {
            for capture in m.captures {
                let node = capture.node;
                let range = node.byte_range();
                if chunked_ranges.iter().any(|r: &std::ops::Range<usize>| r.contains(&range.start)) {
                    continue;
                }
                let start_line = node.start_position().row + 1;
                let end_line = node.end_position().row + 1;
                let mut snippet = node.utf8_text(content.as_bytes())?.to_string();
                let mut current_node = node;
                while let Some(prev) = current_node.prev_sibling() {
                    if prev.kind().contains("comment") {
                        snippet = format!("{} \n{}", prev.utf8_text(content.as_bytes())?, snippet);
                    } else {
                        break;
                    }
                    current_node = prev;
                }
                chunks.push((start_line, end_line, snippet));
                chunked_ranges.insert(range);
            }
        }
    }

    if chunks.is_empty() {
        return Ok(chunk_text_fallback(content, max_lines));
    }

    Ok(chunks)
}
