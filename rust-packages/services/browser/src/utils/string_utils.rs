pub fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }
}

pub fn redact_sensitive(text: &str, sensitive_words: &[&str]) -> String {
    let mut result = text.to_string();
    for word in sensitive_words {
        if result.contains(word) {
            result = result.replace(word, "[REDACTED]");
        }
    }
    result
}

pub fn slugify(s: &str) -> String {
    s.to_lowercase()
        .replace(' ', "-")
        .replace(|c: char| !c.is_alphanumeric() && c != '-', "")
}
