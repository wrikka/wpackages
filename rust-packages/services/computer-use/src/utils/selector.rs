//! Selector parsing utilities

/// Parse element reference from string (e.g., "@e1" -> 1)
pub fn parse_element_ref(s: &str) -> Option<u32> {
    let s = s.trim();
    if !s.starts_with('@') {
        return None;
    }
    let id = s.trim_start_matches('@');
    if !id.starts_with('e') {
        return None;
    }
    id.trim_start_matches('e').parse().ok()
}

/// Parse screen selector (e.g., "screen:0" -> 0)
pub fn parse_screen_selector(s: &str) -> Option<u32> {
    let s = s.trim().to_lowercase();
    if let Some(index) = s.strip_prefix("screen:") {
        index.parse().ok()
    } else {
        None
    }
}

/// Parse window selector (e.g., "title:Notepad" -> "Notepad")
pub fn parse_title_selector(s: &str) -> Option<String> {
    let s = s.trim();
    if let Some(title) = s.strip_prefix("title:") {
        Some(title.to_string())
    } else {
        None
    }
}

/// Parse process selector (e.g., "process:chrome" -> "chrome")
pub fn parse_process_selector(s: &str) -> Option<String> {
    let s = s.trim();
    if let Some(process) = s.strip_prefix("process:") {
        Some(process.to_string())
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_element_ref() {
        assert_eq!(parse_element_ref("@e1"), Some(1));
        assert_eq!(parse_element_ref("@e123"), Some(123));
        assert_eq!(parse_element_ref("@x1"), None);
        assert_eq!(parse_element_ref("e1"), None);
    }

    #[test]
    fn test_parse_screen_selector() {
        assert_eq!(parse_screen_selector("screen:0"), Some(0));
        assert_eq!(parse_screen_selector("SCREEN:1"), Some(1));
        assert_eq!(parse_screen_selector("invalid"), None);
    }

    #[test]
    fn test_parse_title_selector() {
        assert_eq!(parse_title_selector("title:Notepad"), Some("Notepad".to_string()));
        assert_eq!(parse_title_selector("invalid"), None);
    }
}
