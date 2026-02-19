//! services/tool_generator.rs

use std::path::PathBuf;
use std::process::Command;
use tempfile::{tempdir, TempDir};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ToolGeneratorError {
    #[error("Failed to create temporary directory for tool generation")]
    TempDir(#[from] std::io::Error),

    #[error("Failed to write tool source code to file: {0}")]
    WriteCode(String),

    #[error("Failed to execute rustc compiler: {0}")]
    CompilerExecution(String),

    #[error("Tool compilation failed: {0}")]
    CompilationFailed(String),
}

/// Represents a successfully generated tool.
///
/// This struct holds the path to the compiled dynamic library and the temporary
/// directory that contains it. The `_temp_dir` field must be kept in scope to prevent
/// the directory and the compiled library from being deleted prematurely.
pub struct GeneratedTool {
    pub path: PathBuf,
    _temp_dir: TempDir,
}


/// A service that can compile and dynamically load new tools at runtime.
#[derive(Clone, Default)]
pub struct ToolGenerator;

impl ToolGenerator {
    pub fn new() -> Self {
        Self::default()
    }

    /// Compiles a string of Rust code into a dynamic library at runtime.
    ///
    /// # Security Warning
    /// This function compiles and prepares arbitrary Rust code for execution.
    /// Never use this with untrusted code, as it can lead to arbitrary code execution
    /// on the host machine.
    ///
    /// # Arguments
    /// * `code` - A string slice containing the Rust code for the new tool.
    ///
    /// # Returns
    /// A `Result` containing a `GeneratedTool` on success, or a `ToolGeneratorError` on failure.
    pub async fn generate_tool(&self, code: &str) -> Result<GeneratedTool, ToolGeneratorError> {
        let temp_dir = tempdir().map_err(ToolGeneratorError::TempDir)?;
        let file_path = temp_dir.path().join("new_tool.rs");
        tokio::fs::write(&file_path, code)
            .await
            .map_err(|e| ToolGeneratorError::WriteCode(e.to_string()))?;

        let mut output_path = temp_dir.path().join("new_tool");
        output_path.set_extension(std::env::consts::DLL_EXTENSION);

        let output = {
            let file_path = file_path.clone();
            let output_path = output_path.clone();
            tokio::task::spawn_blocking(move || {
                Command::new("rustc")
                    .arg("--crate-type=cdylib")
                    .arg("-o")
                    .arg(&output_path)
                    .arg(&file_path)
                    .output()
            })
            .await
            .unwrap()
        }
        .map_err(|e| ToolGeneratorError::CompilerExecution(e.to_string()))?;

        if !output.status.success() {
            return Err(ToolGeneratorError::CompilationFailed(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ));
        }

        Ok(GeneratedTool {
            path: output_path,
            _temp_dir: temp_dir,
        })
    }
}
