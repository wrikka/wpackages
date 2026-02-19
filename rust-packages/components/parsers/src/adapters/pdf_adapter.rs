//! Adapter for PDF extraction library
//!
//! Wraps `pdf-extract` to provide a consistent interface

use pdf_extract::extract_text_from_mem;

/// Extract text content from PDF bytes
///
/// # Arguments
/// * `content` - Raw PDF file content as bytes
///
/// # Returns
/// * `Ok(String)` - Extracted text content
/// * `Err(String)` - Error message if extraction fails
pub fn extract_pdf_text(content: &[u8]) -> Result<String, String> {
    extract_text_from_mem(content).map_err(|e| format!("Failed to extract PDF text: {}", e))
}

/// Check if content appears to be a valid PDF
///
/// # Arguments
/// * `content` - Raw file content as bytes
///
/// # Returns
/// * `true` - Content appears to be a PDF
/// * `false` - Content is not a PDF
pub fn is_pdf(content: &[u8]) -> bool {
    content.len() >= 4 && &content[0..4] == b"%PDF"
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_pdf_valid() {
        let pdf_header = b"%PDF-1.4";
        assert!(is_pdf(pdf_header));
    }

    #[test]
    fn test_is_pdf_invalid() {
        let not_pdf = b"Hello world";
        assert!(!is_pdf(not_pdf));
    }

    #[test]
    fn test_is_pdf_too_short() {
        assert!(!is_pdf(b"PDF"));
    }
}
