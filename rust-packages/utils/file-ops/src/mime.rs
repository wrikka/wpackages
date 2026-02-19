//! Provides functionality for guessing MIME types from file extensions.
//!
//! This module uses the `mime_guess` crate to determine the MIME type of a file.
//!
//! # Example
//!
//! ```
//! use file_ops::guess_mime_type;
//! use camino::Utf8Path;
//!
//! let path = Utf8Path::new("image.jpeg");
//! assert_eq!(guess_mime_type(path), Some("image/jpeg".to_string()));
//! ```

use camino::Utf8Path;
use mime_guess::from_path;

/// Guesses the MIME type of a file based on its extension.
///
/// Returns the first guess as a string, or `None` if the MIME type is unknown.
///
/// # Arguments
///
/// * `path` - The path to the file.
pub fn guess_mime_type(path: &Utf8Path) -> Option<String> {
    from_path(path).first_raw().map(|s| s.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_guess_mime_type() {
        let path = Utf8Path::new("test.txt");
        assert_eq!(guess_mime_type(path), Some("text/plain".to_string()));

        let path = Utf8Path::new("image.jpg");
        assert_eq!(guess_mime_type(path), Some("image/jpeg".to_string()));

        let path = Utf8Path::new("unknown");
        assert_eq!(guess_mime_type(path), None);
    }
}