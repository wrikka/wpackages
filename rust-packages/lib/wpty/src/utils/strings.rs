//! String utilities
//!
//! Pure helper functions for string manipulation

/// Truncate a string to a maximum length with ellipsis
pub fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }
}

/// Sanitize a string for use as a filename
pub fn sanitize_filename(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            _ => c,
        })
        .collect()
}

/// Check if a string is a valid shell command (basic check)
pub fn is_valid_command(cmd: &str) -> bool {
    !cmd.is_empty() && !cmd.contains('\0')
}
