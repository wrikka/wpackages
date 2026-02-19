use crate::engine::{
    call_graph::CallGraphResult,
    data_flow::DataFlowGraph,
    dependency_graph::DependencyNode,
    fuzzy::FuzzyMatch,
    git::{BlameResult, DiffResult},
    hybrid::HybridMatch,
    semantic::SemanticMatch,
    signature_extractor::Signature,
    symbol::Symbol,
    syntax::SyntaxMatch,
    text::TextMatch,
};
use clap::ValueEnum;
use serde::Serialize;
use thiserror::Error;

// A trait for types that can be printed in a human-readable format.
pub trait Printable {
    fn print_pretty(&self);
}

// Generic implementation for any slice of Printable items.
impl<T: Printable> Printable for &[T] {
    fn print_pretty(&self) {
        for item in self.iter() {
            item.print_pretty();
            println!("--------------------------------------------------");
        }
    }
}

// Implementations for specific result types

impl Printable for TextMatch {
    fn print_pretty(&self) {
        println!("File: {}:{}", self.path, self.line);
        println!("Text: {}", self.text.trim());
    }
}

impl Printable for SyntaxMatch {
    fn print_pretty(&self) {
        println!("File: {}:{}..{} (Score: {:.2})", self.path, self.start_line, self.end_line, self.score);
        println!("Snippet:\n{}", self.snippet);
    }
}

impl Printable for Symbol {
    fn print_pretty(&self) {
        println!("File: {}:{}", self.location.path, self.location.line);
        println!("Symbol: {} ({:?})", self.name, self.kind);
    }
}

impl Printable for SemanticMatch {
    fn print_pretty(&self) {
        println!("File: {}:{}..{} (Score: {:.4})", self.path, self.start_line, self.end_line, self.score);
        println!("Snippet:\n{}", self.snippet);
    }
}

impl Printable for FuzzyMatch {
    fn print_pretty(&self) {
        println!("File: {}:{}", self.path, self.line);
        println!("Text: {}", self.text.trim());
    }
}

impl Printable for HybridMatch {
    fn print_pretty(&self) {
        println!("File: {}:{} (Score: {:.4})", self.path, self.line, self.score);
        println!("Text: {}", self.text.trim());
    }
}

impl Printable for DiffResult {
    fn print_pretty(&self) {
        let line_num = self.line_number_after.unwrap_or(self.line_number_before.unwrap_or(0));
        println!("File: {}:{}", self.path, line_num);
        println!("Line: {}", self.line);
    }
}

impl Printable for BlameResult {
    fn print_pretty(&self) {
        println!("Commit: {}", self.commit);
        println!("Author: {}", self.author);
        if !self.date.is_empty() {
            println!("Date: {}", self.date);
        }
        println!("Line {}: {}", self.line_number, self.content.trim());
    }
}

impl Printable for CallGraphResult {
    fn print_pretty(&self) {
        println!("Function: {}", self.function);
        println!("Location: {}:{}", self.path, self.line);
    }
}

impl Printable for DataFlowGraph {
    fn print_pretty(&self) {
        println!("Data Flow Graph (Assignments):");
        for (var, assignments) in &self.assignments {
            println!("Variable: {}", var);
            for (i, node) in assignments.iter().enumerate() {
                println!("  {}: L{}:{} -> {}", i, node.location.line, node.location.col, node.text);
            }
        }
    }
}

impl Printable for DependencyNode {
    fn print_pretty(&self) {
        println!("File: {}", self.path);
        println!("Dependencies:");
        for dep in &self.dependencies {
            println!("  - {}", dep);
        }
    }
}

impl Printable for Signature {
    fn print_pretty(&self) {
        let params = self.params.join(", ");
        println!("Function: {}({}) -> {}", self.name, params, self.return_type.as_deref().unwrap_or("void"));
    }
}

// Generic implementation for single items that are not slices
impl<T: Printable> Printable for T {
    fn print_pretty(&self) {
        <T as Printable>::print_pretty(self)
    }
}

// The main function to handle printing based on format
#[derive(Debug, Clone, ValueEnum, Serialize)]
pub enum OutputFormat {
    Json,
    Pretty,
}

#[derive(Error, Debug)]
pub enum OutputError {
    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}

pub fn print_results<T: Serialize + Printable>(
    results: &T,
    format: &OutputFormat,
) -> Result<(), OutputError> {
    match format {
        OutputFormat::Pretty => {
            results.print_pretty();
        }
        OutputFormat::Json => {
            println!("{}", serde_json::to_string(results)?);
        }
    }
    Ok(())
}
