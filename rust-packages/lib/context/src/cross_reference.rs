use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

/// Cross-reference analyzer for analyzing relationships between symbols
pub struct CrossReferenceAnalyzer {
    references: HashMap<String, Vec<Reference>>,
    definitions: HashMap<String, Definition>,
}

impl CrossReferenceAnalyzer {
    /// Creates a new cross-reference analyzer
    pub fn new() -> Self {
        Self {
            references: HashMap::new(),
            definitions: HashMap::new(),
        }
    }

    /// Adds a definition
    pub fn add_definition(&mut self, definition: Definition) {
        self.definitions.insert(definition.name.clone(), definition);
    }

    /// Adds a reference
    pub fn add_reference(&mut self, reference: Reference) {
        self.references
            .entry(reference.target.clone())
            .or_default()
            .push(reference);
    }

    /// Gets all references to a symbol
    pub fn get_references(&self, symbol_name: &str) -> Vec<&Reference> {
        self.references
            .get(symbol_name)
            .map(|refs| refs.iter().collect())
            .unwrap_or_default()
    }

    /// Gets definition of a symbol
    pub fn get_definition(&self, symbol_name: &str) -> Option<&Definition> {
        self.definitions.get(symbol_name)
    }

    /// Gets all symbols referenced by a file
    pub fn get_referenced_symbols(&self, file_path: &PathBuf) -> HashSet<String> {
        let mut symbols = HashSet::new();

        for (symbol_name, refs) in &self.references {
            for ref_ in refs {
                if ref_.source_file == *file_path {
                    symbols.insert(symbol_name.clone());
                }
            }
        }

        symbols
    }

    /// Gets all files that reference a symbol
    pub fn get_referencing_files(&self, symbol_name: &str) -> Vec<PathBuf> {
        self.references
            .get(symbol_name)
            .map(|refs| refs.iter().map(|r| r.source_file.clone()).collect())
            .unwrap_or_default()
    }

    /// Gets dependency graph
    pub fn get_dependency_graph(&self) -> HashMap<PathBuf, HashSet<String>> {
        let mut graph = HashMap::new();

        for refs in self.references.values() {
            for ref_ in refs {
                graph
                    .entry(ref_.source_file.clone())
                    .or_insert_with(HashSet::new)
                    .insert(ref_.target.clone());
            }
        }

        graph
    }

    /// Gets impact analysis for changes
    pub fn get_impact_analysis(&self, changed_symbol: &str) -> ImpactAnalysis {
        let references = self.get_references(changed_symbol);
        let referencing_files: Vec<PathBuf> =
            references.iter().map(|r| r.source_file.clone()).collect();

        let mut transitive_impact = HashSet::new();
        for file in &referencing_files {
            let symbols = self.get_referenced_symbols(file);
            transitive_impact.extend(symbols);
        }
        transitive_impact.remove(changed_symbol);

        ImpactAnalysis {
            symbol: changed_symbol.to_string(),
            direct_references: references.len(),
            referencing_files,
            transitive_impact,
        }
    }
}

impl Default for CrossReferenceAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a symbol definition
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Definition {
    pub name: String,
    pub kind: String,
    pub file_path: PathBuf,
    pub line: usize,
    pub column: usize,
}

/// Represents a symbol reference
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Reference {
    pub target: String,
    pub source_file: PathBuf,
    pub line: usize,
    pub column: usize,
}

/// Impact analysis result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ImpactAnalysis {
    pub symbol: String,
    pub direct_references: usize,
    pub referencing_files: Vec<PathBuf>,
    pub transitive_impact: HashSet<String>,
}
