use crate::error::Result;
use nucleo::pattern::{Atom, AtomKind, CaseMatching, Normalization};
use nucleo::{Config, Nucleo, Utf32String};
use std::sync::Arc;

/// Completion source for auto-suggestions
pub trait CompletionSource: Send + Sync {
    fn complete(&self, input: &str) -> Vec<String>;
    fn is_async(&self) -> bool { false }
}

/// Simple static completion source
pub struct StaticCompletion {
    options: Vec<String>,
}

impl StaticCompletion {
    pub fn new(options: impl IntoIterator<Item = impl Into<String>>) -> Self {
        Self {
            options: options.into_iter().map(|s| s.into()).collect(),
        }
    }
}

impl CompletionSource for StaticCompletion {
    fn complete(&self, _input: &str) -> Vec<String> {
        self.options.clone()
    }
}

/// File path completion
pub struct PathCompletion {
    dirs_only: bool,
    extensions: Option<Vec<String>>,
}

impl PathCompletion {
    pub fn new() -> Self {
        Self {
            dirs_only: false,
            extensions: None,
        }
    }

    pub fn dirs_only(mut self) -> Self {
        self.dirs_only = true;
        self
    }

    pub fn with_extensions(mut self, extensions: Vec<String>) -> Self {
        self.extensions = Some(extensions);
        self
    }
}

impl CompletionSource for PathCompletion {
    fn complete(&self, input: &str) -> Vec<String> {
        let mut completions = Vec::new();
        
        let path = std::path::Path::new(input);
        let dir = if input.ends_with('/') || input.is_empty() {
            path.to_path_buf()
        } else {
            path.parent().map(|p| p.to_path_buf()).unwrap_or_default()
        };

        if let Ok(entries) = std::fs::read_dir(&dir) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    let is_dir = metadata.is_dir();
                    
                    if self.dirs_only && !is_dir {
                        continue;
                    }

                    if let Some(name) = entry.file_name().to_str() {
                        if let Some(ref exts) = self.extensions {
                            if !is_dir {
                                let has_ext = exts.iter().any(|ext| {
                                    name.to_lowercase().ends_with(&format!(".{}", ext.to_lowercase()))
                                });
                                if !has_ext {
                                    continue;
                                }
                            }
                        }

                        let completion = if is_dir {
                            format!("{}{}/", input, name)
                        } else {
                            format!("{}{}", input, name)
                        };
                        completions.push(completion);
                    }
                }
            }
        }

        completions.sort();
        completions
    }
}

/// Fuzzy matcher using nucleo
pub struct FuzzyMatcher {
    nucleo: Nucleo<String>,
    items: Vec<String>,
}

impl FuzzyMatcher {
    pub fn new() -> Self {
        let config = Config::DEFAULT;
        let nucleo = Nucleo::new(config, Arc::new(|| {}), None, 1);
        
        Self {
            nucleo,
            items: Vec::new(),
        }
    }

    pub fn with_items(mut self, items: impl IntoIterator<Item = impl Into<String>>) -> Self {
        self.items = items.into_iter().map(|s| s.into()).collect();
        
        // Populate nucleo
        let injector = self.nucleo.injector();
        for item in &self.items {
            let utf32: Utf32String = item.as_str().into();
            injector.push(item.clone(), utf32);
        }
        
        self
    }

    pub fn search(&mut self, pattern: &str, limit: usize) -> Vec<(String, u32)> {
        let atom = Atom::new(
            pattern,
            CaseMatching::Smart,
            Normalization::Smart,
            AtomKind::Fuzzy,
            self.nucleo.pattern().injected_builder(),
        );
        
        self.nucleo.pattern().reparse(
            None,
            atom,
            self.nucleo.snapshot().item_count(),
        );

        self.nucleo.tick(10);
        
        let snapshot = self.nucleo.snapshot();
        let mut results = Vec::new();
        
        for (item, score) in snapshot.matched_items(..limit as u32).map(|item| {
            (item.data.clone(), item.score)
        }) {
            results.push((item, score));
        }
        
        results.sort_by(|a, b| b.1.cmp(&a.1));
        results
    }
}

impl Default for FuzzyMatcher {
    fn default() -> Self {
        Self::new()
    }
}

/// Async completion source trait
#[async_trait::async_trait]
pub trait AsyncCompletionSource: Send + Sync {
    async fn complete(&self, input: &str) -> Vec<String>;
}

/// Command completion (for shell integration)
pub struct CommandCompletion;

impl CommandCompletion {
    pub fn complete_commands(&self, prefix: &str) -> Vec<String> {
        let mut commands = Vec::new();
        
        // Common shell commands
        let common = [
            "cd", "ls", "pwd", "cat", "grep", "find", "mkdir", "rm",
            "cp", "mv", "touch", "chmod", "chown", "tar", "gzip",
            "git", "docker", "cargo", "npm", "yarn", "pnpm",
            "python", "node", "rustc", "go", "javac",
        ];
        
        for cmd in &common {
            if cmd.starts_with(prefix) {
                commands.push(cmd.to_string());
            }
        }
        
        // Search PATH for executables
        if let Ok(path) = std::env::var("PATH") {
            for dir in path.split(std::path::MAIN_SEPARATOR) {
                if let Ok(entries) = std::fs::read_dir(dir) {
                    for entry in entries.flatten() {
                        if let Some(name) = entry.file_name().to_str() {
                            if name.starts_with(prefix) {
                                commands.push(name.to_string());
                            }
                        }
                    }
                }
            }
        }
        
        commands.sort();
        commands.dedup();
        commands.truncate(50);
        commands
    }
}
