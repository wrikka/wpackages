use crate::engine::symbol::{extract_symbols, Symbol, SymbolKind, SymbolSearchError};
use ignore::{WalkBuilder, WalkError};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CallGraphError {
    #[error("directory walk error: {0}")]
    Walk(#[from] WalkError),
    #[error("symbol search error: {0}")]
    Symbol(#[from] SymbolSearchError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CallGraph {
    nodes: HashMap<String, Symbol>,
    forward_edges: HashMap<String, HashSet<String>>,
    backward_edges: HashMap<String, HashSet<String>>,
}

impl CallGraph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            forward_edges: HashMap::new(),
            backward_edges: HashMap::new(),
        }
    }

    pub fn build(root: &str) -> Result<Self, CallGraphError> {
        let mut graph = Self::new();
        let walker = WalkBuilder::new(root).build();

        let mut symbols_by_file: HashMap<String, Vec<Symbol>> = HashMap::new();

        for entry in walker {
            let entry = entry?;
            if entry.file_type().map_or(false, |t| t.is_file()) {
                let path_str = entry.path().to_string_lossy().into_owned();
                symbols_by_file.insert(path_str, extract_symbols(entry.path())?);
            }
        }

        for symbols in symbols_by_file.values() {
            for sym in symbols {
                if matches!(sym.kind, SymbolKind::Function | SymbolKind::Method) {
                    graph.nodes.insert(sym.name.clone(), sym.clone());
                }
            }
        }

        for (_, symbols) in symbols_by_file {
            let mut definitions: Vec<&Symbol> = symbols
                .iter()
                .filter(|s| matches!(s.kind, SymbolKind::Function | SymbolKind::Method))
                .collect();
            definitions.sort_by_key(|s| s.location.line);

            let calls: Vec<&Symbol> = symbols.iter().filter(|s| s.kind == SymbolKind::Call).collect();

            for call in calls {
                let mut enclosing_function = None;
                for def in &definitions {
                    if def.location.line < call.location.line {
                        enclosing_function = Some(def);
                    } else {
                        break;
                    }
                }

                if let Some(caller) = enclosing_function {
                    if graph.nodes.contains_key(&call.name) {
                        graph.add_edge(caller.name.clone(), call.name.clone());
                    }
                }
            }
        }

        Ok(graph)
    }

    fn add_edge(&mut self, caller: String, callee: String) {
        self.forward_edges.entry(caller.clone()).or_default().insert(callee.clone());
        self.backward_edges.entry(callee).or_default().insert(caller);
    }

    pub fn get_callees(&self, function_name: &str) -> Option<&HashSet<String>> {
        self.forward_edges.get(function_name)
    }

    pub fn get_callers(&self, function_name: &str) -> Option<&HashSet<String>> {
        self.backward_edges.get(function_name)
    }
}
