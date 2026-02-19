//! Codebase understanding types and structures

use serde::{Deserialize, Serialize};

/// Codebase analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodebaseAnalysis {
    /// Unique analysis ID
    pub id: String,
    /// Project name
    pub project_name: String,
    /// Root directory
    pub root_path: String,
    /// Files in the codebase
    pub files: Vec<CodeFile>,
    /// Dependencies between files
    pub dependencies: Vec<Dependency>,
    /// Modules/packages
    pub modules: Vec<Module>,
    /// Analysis timestamp
    pub analyzed_at: chrono::DateTime<chrono::Utc>,
    /// Analysis status
    pub status: AnalysisStatus,
}

/// A code file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeFile {
    /// File path
    pub path: String,
    /// File language
    pub language: String,
    /// File size in bytes
    pub size: u64,
    /// Number of lines
    pub line_count: usize,
    /// Functions defined in this file
    pub functions: Vec<Function>,
    /// Classes/Structs defined in this file
    pub classes: Vec<Class>,
    /// Imports/dependencies
    pub imports: Vec<String>,
    /// Embedding vector (for semantic search)
    pub embedding: Option<Vec<f32>>,
}

/// A function
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Function {
    /// Function name
    pub name: String,
    /// Start line
    pub start_line: usize,
    /// End line
    pub end_line: usize,
    /// Function signature
    pub signature: String,
    /// Documentation
    pub documentation: Option<String>,
    /// Whether it's exported/public
    pub is_public: bool,
}

/// A class/struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Class {
    /// Class name
    pub name: String,
    /// Start line
    pub start_line: usize,
    /// End line
    pub end_line: usize,
    /// Methods
    pub methods: Vec<Function>,
    /// Properties/fields
    pub properties: Vec<Property>,
    /// Whether it's exported/public
    pub is_public: bool,
}

/// A property/field
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    /// Property name
    pub name: String,
    /// Property type
    pub property_type: String,
    /// Whether it's public
    pub is_public: bool,
}

/// A dependency between files
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    /// Source file
    pub from: String,
    /// Target file
    pub to: String,
    /// Dependency type
    pub dependency_type: DependencyType,
}

/// Type of dependency
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DependencyType {
    /// Import dependency
    Import,
    /// Function call
    FunctionCall,
    /// Class inheritance
    Inheritance,
    /// Type reference
    TypeReference,
}

/// A module/package
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Module {
    /// Module name
    pub name: String,
    /// Module path
    pub path: String,
    /// Files in this module
    pub files: Vec<String>,
    /// Dependencies on other modules
    pub dependencies: Vec<String>,
}

/// Analysis status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AnalysisStatus {
    /// Analysis is in progress
    Analyzing,
    /// Analysis completed
    Completed,
    /// Analysis failed
    Failed,
}

impl CodebaseAnalysis {
    /// Create a new codebase analysis
    pub fn new(id: String, project_name: String, root_path: String) -> Self {
        Self {
            id,
            project_name,
            root_path,
            files: Vec::new(),
            dependencies: Vec::new(),
            modules: Vec::new(),
            analyzed_at: chrono::Utc::now(),
            status: AnalysisStatus::Analyzing,
        }
    }

    /// Get all functions in the codebase
    pub fn get_all_functions(&self) -> Vec<&Function> {
        self.files
            .iter()
            .flat_map(|file| file.functions.iter())
            .collect()
    }

    /// Get all classes in the codebase
    pub fn get_all_classes(&self) -> Vec<&Class> {
        self.files
            .iter()
            .flat_map(|file| file.classes.iter())
            .collect()
    }

    /// Find files by language
    pub fn find_files_by_language(&self, language: &str) -> Vec<&CodeFile> {
        self.files
            .iter()
            .filter(|file| file.language == language)
            .collect()
    }

    /// Find dependencies for a file
    pub fn find_dependencies_for_file(&self, file_path: &str) -> Vec<&Dependency> {
        self.dependencies
            .iter()
            .filter(|dep| dep.from == file_path)
            .collect()
    }

    /// Find dependents (files that depend on this file)
    pub fn find_dependents(&self, file_path: &str) -> Vec<&Dependency> {
        self.dependencies
            .iter()
            .filter(|dep| dep.to == file_path)
            .collect()
    }
}
