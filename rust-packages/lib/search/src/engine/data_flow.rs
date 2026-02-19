#[cfg(feature = "symbol")]
use crate::engine::symbol::{Symbol, SymbolKind, Location, extract_symbols};
#[cfg(feature = "symbol")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "symbol")]
use std::collections::{HashMap, VecDeque};
#[cfg(feature = "symbol")]
use tree_sitter::{Node, Parser, Query, QueryCursor};
#[cfg(feature = "symbol")]
use std::path::Path;

#[cfg(feature = "symbol")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowNode {
    location: Location,
    text: String,
}

#[cfg(feature = "symbol")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlowGraph {
    // Variable name -> list of assignments
    assignments: HashMap<String, Vec<FlowNode>>,
}

#[cfg(feature = "symbol")]
pub fn analyze_file(path: &Path) -> anyhow::Result<DataFlowGraph> {
    let code = std::fs::read_to_string(path)?;
    let language = super::symbol::get_language(path).ok_or_else(|| anyhow::anyhow!("Unsupported language"))?;
    let mut parser = Parser::new();
    parser.set_language(language)?;
    let tree = parser.parse(&code, None).unwrap();

    let mut assignments = HashMap::new();

    let query_str = "(assignment_expression left: (identifier) @var value: (_) @value)";
    let query = Query::new(language, query_str)?;
    let mut cursor = QueryCursor::new();

    for m in cursor.matches(&query, tree.root_node(), code.as_bytes()) {
        let var_name_node = m.captures[0].node;
        let value_node = m.captures[1].node;

        let var_name = var_name_node.utf8_text(code.as_bytes())?.to_string();
        let value_text = value_node.utf8_text(code.as_bytes())?.to_string();
        let pos = var_name_node.start_position();

        let flow_node = FlowNode {
            location: Location {
                path: path.to_string_lossy().into_owned(),
                line: pos.row + 1,
                col: pos.column + 1,
            },
            text: value_text,
        };

        assignments.entry(var_name).or_insert_with(Vec::new).push(flow_node);
    }

    Ok(DataFlowGraph { assignments })
}

#[cfg(not(feature = "symbol"))]
use serde::{Deserialize, Serialize};

#[cfg(not(feature = "symbol"))]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlowGraph {
    pub assignments: std::collections::HashMap<String, Vec<String>>,
}

#[cfg(not(feature = "symbol"))]
pub fn analyze_file(_path: &std::path::Path) -> anyhow::Result<DataFlowGraph> {
    Ok(DataFlowGraph { assignments: std::collections::HashMap::new() })
}
