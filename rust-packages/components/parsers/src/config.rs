//! Document Parsers Configuration
//!
//! Configuration management using Figment

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentParsersConfig {
    pub pdf: PdfConfig,
    pub markdown: MarkdownConfig,
    pub html: HtmlConfig,
    pub code: CodeConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfConfig {
    pub extract_images: bool,
    pub extract_metadata: bool,
    pub max_pages: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarkdownConfig {
    pub extract_code_blocks: bool,
    pub extract_tables: bool,
    pub preserve_formatting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlConfig {
    pub extract_links: bool,
    pub extract_images: bool,
    pub remove_scripts: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeConfig {
    pub remove_comments: bool,
    pub extract_functions: bool,
    pub extract_classes: bool,
}

impl Default for DocumentParsersConfig {
    fn default() -> Self {
        Self {
            pdf: PdfConfig {
                extract_images: false,
                extract_metadata: true,
                max_pages: None,
            },
            markdown: MarkdownConfig {
                extract_code_blocks: true,
                extract_tables: false,
                preserve_formatting: false,
            },
            html: HtmlConfig {
                extract_links: false,
                extract_images: false,
                remove_scripts: true,
            },
            code: CodeConfig {
                remove_comments: true,
                extract_functions: true,
                extract_classes: true,
            },
        }
    }
}

impl DocumentParsersConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("DOC_PARSERS_").split("__"))
            .extract()
    }
}
