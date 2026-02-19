use crate::error::EditorError;

pub struct SyntaxService;

impl Default for SyntaxService {
    fn default() -> Self {
        Self::new()
    }
}

impl SyntaxService {
    pub fn new() -> Self {
        Self
    }

    pub fn detect_language(&self, path: &str) -> Result<&'static str, EditorError> {
        let ext = std::path::Path::new(path)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_lowercase();

        match ext.as_str() {
            "rs" => Ok("rs"),
            "toml" => Ok("toml"),
            "json" => Ok("json"),
            "md" => Ok("md"),
            "js" => Ok("javascript"),
            "ts" => Ok("typescript"),
            "tsx" => Ok("tsx"),
            "jsx" => Ok("jsx"),
            "html" => Ok("html"),
            "css" => Ok("css"),
            _ => Err(EditorError::LanguageDetection(path.to_string())),
        }
    }
}
