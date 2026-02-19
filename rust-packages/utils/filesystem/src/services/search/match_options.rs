use serde::{Deserialize, Serialize};

/// Base options for pattern matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchOptions {
    pub case_sensitive: bool,
    pub regex_mode: bool,
    pub whole_word: bool,
}

impl MatchOptions {
    pub fn new() -> Self {
        Self {
            case_sensitive: false,
            regex_mode: false,
            whole_word: false,
        }
    }

    pub fn with_case_sensitive(mut self, case_sensitive: bool) -> Self {
        self.case_sensitive = case_sensitive;
        self
    }

    pub fn with_regex_mode(mut self, regex_mode: bool) -> Self {
        self.regex_mode = regex_mode;
        self
    }

    pub fn with_whole_word(mut self, whole_word: bool) -> Self {
        self.whole_word = whole_word;
        self
    }
}

impl Default for MatchOptions {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_match_options_builder() {
        let options = MatchOptions::new()
            .with_case_sensitive(true)
            .with_regex_mode(true)
            .with_whole_word(true);

        assert!(options.case_sensitive);
        assert!(options.regex_mode);
        assert!(options.whole_word);
    }

    #[test]
    fn test_match_options_default() {
        let options = MatchOptions::default();
        assert!(!options.case_sensitive);
        assert!(!options.regex_mode);
        assert!(!options.whole_word);
    }
}
