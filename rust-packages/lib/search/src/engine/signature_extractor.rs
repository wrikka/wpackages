#[cfg(feature = "symbol")]
use crate::engine::symbol;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
#[cfg(feature = "symbol")]
use std::str::Utf8Error;
#[cfg(feature = "symbol")]
use thiserror::Error;
#[cfg(feature = "symbol")]
use tree_sitter::{LanguageError, Parser, Query, QueryCursor, QueryError};

#[cfg(feature = "symbol")]
#[derive(Error, Debug)]
pub enum SignatureExtractorError {
    #[error("I/O error reading file {0}: {1}")]
    Io(PathBuf, std::io::Error),
    #[error("tree-sitter language error: {0}")]
    Language(#[from] LanguageError),
    #[error("tree-sitter query error: {0}")]
    Query(#[from] QueryError),
    #[error("UTF-8 error in file {0}: {1}")]
    Utf8(PathBuf, Utf8Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub name: String,
    pub type_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signature {
    pub name: String,
    pub parameters: Vec<Parameter>,
    pub return_type: Option<String>,
    pub line: usize,
}

#[cfg(feature = "symbol")]
fn get_signature_queries(lang: tree_sitter::Language) -> Vec<Query> {
    let queries = [
        "(function_item name: (identifier) @name parameters: (parameters) @params return_type: (_) @return)",
        "(function_item name: (identifier) @name parameters: (parameters) @params)",
        "(function_declaration name: (identifier) @name parameters: (formal_parameters) @params return_type: (type_annotation) @return)",
        "(function_declaration name: (identifier) @name parameters: (formal_parameters) @params)",
        "(method_definition name: (property_identifier) @name parameters: (formal_parameters) @params)",
        "(parameters (parameter name: (identifier) @param_name type: (_) @param_type))",
        "(formal_parameters (required_parameter name: (identifier) @param_name type_annotation: (_) @param_type))",
    ];
    queries.iter().filter_map(|q| Query::new(lang, q).ok()).collect()
}

#[cfg(feature = "symbol")]
pub fn extract_from_file(path: &Path) -> Result<Vec<Signature>, SignatureExtractorError> {
    let Some(language) = symbol::get_language(path) else { return Ok(Vec::new()); };
    let code = std::fs::read_to_string(path).map_err(|e| SignatureExtractorError::Io(path.to_path_buf(), e))?;
    let mut parser = Parser::new();
    parser.set_language(language)?;
    let tree = parser.parse(&code, None).unwrap();
    let queries = get_signature_queries(language);
    let mut signatures = Vec::new();

    for query in queries {
        let mut cursor = QueryCursor::new();
        for m in cursor.matches(&query, tree.root_node(), code.as_bytes()) {
            let mut name = "".to_string();
            let mut params_text = "".to_string();
            let mut return_text = None;
            let node = m.captures[0].node;

            for cap in m.captures {
                let cap_name = &query.capture_names()[cap.index as usize];
                let text = cap.node.utf8_text(code.as_bytes()).map_err(|e| SignatureExtractorError::Utf8(path.to_path_buf(), e))?;
                match cap_name.as_str() {
                    "name" => name = text.to_string(),
                    "params" => params_text = text.to_string(),
                    "return" => return_text = Some(text.to_string()),
                    _ => {},
                }
            }

            if !name.is_empty() {
                let mut parameters = Vec::new();
                if !params_text.is_empty() {
                    for p in params_text.split(',') {
                        let mut parts = p.trim().splitn(2, ':');
                        let param_name = parts.next().unwrap_or("").trim().to_string();
                        let type_name = parts.next().map(|s| s.trim().to_string());
                        if !param_name.is_empty() {
                            parameters.push(Parameter { name: param_name, type_name });
                        }
                    }
                }

                signatures.push(Signature {
                    name,
                    parameters,
                    return_type: return_text,
                    line: node.start_position().row + 1,
                });
            }
        }
    }
    Ok(signatures)
}

#[cfg(not(feature = "symbol"))]
pub fn extract_from_file(_path: &Path) -> Result<Vec<Signature>, anyhow::Error> {
    Ok(Vec::new())
}
