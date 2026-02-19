//! File type detection and color mapping

use super::palette::Palette;
use ratatui::style::Color;

/// File type for color mapping
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FileType {
    Directory,
    Code,
    Text,
    Image,
    Archive,
    Other,
}

impl FileType {
    /// Determine file type from extension
    pub fn from_extension(ext: &str) -> Self {
        match ext.to_lowercase().as_str() {
            // Code files
            "rs" | "toml" | "json" | "yaml" | "yml" | "xml" | "html" | "css" | "js" | "ts"
            | "tsx" | "jsx" | "py" | "go" | "java" | "c" | "cpp" | "h" | "hpp" | "cs" | "php"
            | "rb" | "swift" | "kt" | "scala" | "sh" | "bash" | "zsh" | "fish" | "sql" => {
                FileType::Code
            }

            // Text files
            "txt" | "md" | "rst" | "adoc" | "log" => FileType::Text,

            // Image files
            "png" | "jpg" | "jpeg" | "gif" | "svg" | "webp" | "bmp" | "ico" => FileType::Image,

            // Archive files
            "zip" | "tar" | "gz" | "bz2" | "xz" | "7z" | "rar" | "tgz" => FileType::Archive,

            _ => FileType::Other,
        }
    }

    /// Get color for this file type from palette
    pub fn get_color(self, palette: &Palette) -> Color {
        match self {
            FileType::Directory => palette.file_directory,
            FileType::Code => palette.file_code,
            FileType::Text => palette.file_text,
            FileType::Image => palette.file_image,
            FileType::Archive => palette.file_archive,
            FileType::Other => palette.on_surface_variant,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_type_detection() {
        assert_eq!(FileType::from_extension("rs"), FileType::Code);
        assert_eq!(FileType::from_extension("txt"), FileType::Text);
        assert_eq!(FileType::from_extension("png"), FileType::Image);
        assert_eq!(FileType::from_extension("zip"), FileType::Archive);
        assert_eq!(FileType::from_extension("unknown"), FileType::Other);
    }

    #[test]
    fn test_file_type_color() {
        let palette = Palette::default();
        assert_eq!(FileType::Code.get_color(&palette), palette.file_code);
    }
}
