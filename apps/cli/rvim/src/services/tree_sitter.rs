use crate::error::Result;
use std::path::Path;
use tree_sitter::{Language, Parser, Tree};
use tree_sitter_highlight::{HighlightConfiguration, HighlightEvent, Highlighter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SyntaxHighlight {
    Normal,
    Keyword,
    String,
    Function,
    Variable,
    Comment,
    Type,
    Number,
    Operator,
    Punctuation,
    Constant,
    Attribute,
    Tag,
    Special,
}

impl From<u32> for SyntaxHighlight {
    fn from(value: u32) -> Self {
        match value {
            0 => SyntaxHighlight::Normal,
            1 => SyntaxHighlight::Keyword,
            2 => SyntaxHighlight::String,
            3 => SyntaxHighlight::Function,
            4 => SyntaxHighlight::Variable,
            5 => SyntaxHighlight::Comment,
            6 => SyntaxHighlight::Type,
            7 => SyntaxHighlight::Number,
            8 => SyntaxHighlight::Operator,
            9 => SyntaxHighlight::Punctuation,
            10 => SyntaxHighlight::Constant,
            11 => SyntaxHighlight::Attribute,
            12 => SyntaxHighlight::Tag,
            13 => SyntaxHighlight::Special,
            _ => SyntaxHighlight::Normal,
        }
    }
}

pub struct TreeSitterService {
    parser: Parser,
    highlighter: Highlighter,
    rust_config: HighlightConfiguration,
    javascript_config: HighlightConfiguration,
    typescript_config: HighlightConfiguration,
    python_config: HighlightConfiguration,
    go_config: HighlightConfiguration,
    json_config: HighlightConfiguration,
}

impl TreeSitterService {
    pub fn new() -> Result<Self> {
        let parser = Parser::new();
        let highlighter = Highlighter::new();

        let rust_config = Self::create_rust_config()?;
        let javascript_config = Self::create_javascript_config()?;
        let typescript_config = Self::create_typescript_config()?;
        let python_config = Self::create_python_config()?;
        let go_config = Self::create_go_config()?;
        let json_config = Self::create_json_config()?;

        Ok(Self {
            parser,
            highlighter,
            rust_config,
            javascript_config,
            typescript_config,
            python_config,
            go_config,
            json_config,
        })
    }

    fn create_rust_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_rust::LANGUAGE.into();
        let config = HighlightConfiguration::new(
            language,
            "rust",
            tree_sitter_rust::HIGHLIGHTS_QUERY,
            "",
            "",
        )
        .map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to create rust config: {}", e))
        })?;
        Ok(config)
    }

    fn create_javascript_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_javascript::LANGUAGE.into();
        let config = HighlightConfiguration::new(
            language,
            "javascript",
            tree_sitter_javascript::HIGHLIGHT_QUERY,
            "",
            "",
        )
        .map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to create javascript config: {}", e))
        })?;
        Ok(config)
    }

    fn create_typescript_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into();
        let config = HighlightConfiguration::new(
            language,
            "typescript",
            tree_sitter_typescript::HIGHLIGHTS_QUERY,
            "",
            "",
        )
        .map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to create typescript config: {}", e))
        })?;
        Ok(config)
    }

    fn create_python_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_python::LANGUAGE.into();
        let config = HighlightConfiguration::new(
            language,
            "python",
            tree_sitter_python::HIGHLIGHTS_QUERY,
            "",
            "",
        )
        .map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to create python config: {}", e))
        })?;
        Ok(config)
    }

    fn create_go_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_go::LANGUAGE.into();
        let config =
            HighlightConfiguration::new(language, "go", tree_sitter_go::HIGHLIGHTS_QUERY, "", "")
                .map_err(|e| {
                crate::error::AppError::TreeSitter(format!("Failed to create go config: {}", e))
            })?;
        Ok(config)
    }

    fn create_json_config() -> Result<HighlightConfiguration> {
        let language = tree_sitter_json::LANGUAGE.into();
        let config = HighlightConfiguration::new(
            language,
            "json",
            tree_sitter_json::HIGHLIGHTS_QUERY,
            "",
            "",
        )
        .map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to create json config: {}", e))
        })?;
        Ok(config)
    }

    pub fn parse(&mut self, source: &str, language: &str) -> Result<Tree> {
        let lang = self.get_language(language)?;
        self.parser.set_language(&lang).map_err(|e| {
            crate::error::AppError::TreeSitter(format!("Failed to set language: {}", e))
        })?;
        self.parser.parse(source, None).ok_or_else(|| {
            crate::error::AppError::TreeSitter("Failed to parse source code".to_string())
        })
    }

    pub fn highlight(
        &mut self,
        source: &str,
        language: &str,
    ) -> Result<Vec<(usize, usize, SyntaxHighlight)>> {
        let config = match language {
            "rust" => &self.rust_config,
            "javascript" => &self.javascript_config,
            "typescript" => &self.typescript_config,
            "python" => &self.python_config,
            "go" => &self.go_config,
            "json" => &self.json_config,
            _ => {
                return Err(crate::error::AppError::UnsupportedLanguage(
                    language.to_string(),
                ))
            }
        };

        let source_bytes = source.as_bytes();
        let highlights = self
            .highlighter
            .highlight(config, source_bytes, None, |lang| match lang {
                "rust" => Some(&self.rust_config),
                "javascript" => Some(&self.javascript_config),
                "typescript" => Some(&self.typescript_config),
                "python" => Some(&self.python_config),
                "go" => Some(&self.go_config),
                "json" => Some(&self.json_config),
                _ => None,
            })
            .map_err(|e| {
                crate::error::AppError::TreeSitter(format!("Failed to highlight: {}", e))
            })?;

        let mut result = Vec::new();
        for event in highlights {
            match event {
                Ok(HighlightEvent::HighlightStart(highlight)) => {
                    let _highlight_type = SyntaxHighlight::from(highlight.0 as u32);
                }
                Ok(HighlightEvent::HighlightEnd) => {}
                Ok(HighlightEvent::Source { start, end }) => {
                    result.push((start, end, SyntaxHighlight::Normal));
                }
                Err(_) => {}
            }
        }

        Ok(result)
    }

    pub fn get_language(&self, language: &str) -> Result<Language> {
        match language {
            "rust" => Ok(tree_sitter_rust::LANGUAGE.into()),
            "javascript" => Ok(tree_sitter_javascript::LANGUAGE.into()),
            "typescript" => Ok(tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into()),
            "python" => Ok(tree_sitter_python::LANGUAGE.into()),
            "go" => Ok(tree_sitter_go::LANGUAGE.into()),
            "json" => Ok(tree_sitter_json::LANGUAGE.into()),
            _ => Err(crate::error::AppError::UnsupportedLanguage(
                language.to_string(),
            )),
        }
    }

    #[allow(dead_code)]
    fn get_config(&self, language: &str) -> Result<&HighlightConfiguration> {
        match language {
            "rust" => Ok(&self.rust_config),
            "javascript" => Ok(&self.javascript_config),
            "typescript" => Ok(&self.typescript_config),
            "python" => Ok(&self.python_config),
            "go" => Ok(&self.go_config),
            "json" => Ok(&self.json_config),
            _ => Err(crate::error::AppError::UnsupportedLanguage(
                language.to_string(),
            )),
        }
    }

    pub fn detect_language(&self, path: &Path) -> String {
        let extension = path.extension().and_then(|ext| ext.to_str()).unwrap_or("");

        match extension {
            "rs" => "rust".to_string(),
            "js" => "javascript".to_string(),
            "ts" => "typescript".to_string(),
            "py" => "python".to_string(),
            "go" => "go".to_string(),
            "json" => "json".to_string(),
            _ => "text".to_string(),
        }
    }
}
