use crate::search::error::SearchResult;
use crate::search::utils::{is_word_boundary, normalize_case};
use regex::Regex;

/// Matcher trait for pattern matching
pub trait Matcher: Send + Sync {
    fn matches(&self, text: &str) -> Vec<Match>;
    fn find_all(&self, text: &str) -> Vec<Match>;
}

/// Plain text matcher
pub struct PlainMatcher {
    pattern: String,
    case_sensitive: bool,
    whole_word: bool,
}

impl PlainMatcher {
    pub fn new(pattern: impl Into<String>) -> Self {
        Self {
            pattern: pattern.into(),
            case_sensitive: false,
            whole_word: false,
        }
    }

    pub fn with_case_sensitive(mut self, case_sensitive: bool) -> Self {
        self.case_sensitive = case_sensitive;
        self
    }

    pub fn with_whole_word(mut self, whole_word: bool) -> Self {
        self.whole_word = whole_word;
        self
    }

    fn find_matches(&self, text: &str) -> Vec<Match> {
        let (search_text, pattern) = normalize_case(text, &self.pattern, self.case_sensitive);

        let mut matches = Vec::new();
        let mut start = 0;

        while let Some(pos) = search_text[start..].find(&pattern) {
            let match_start = start + pos;
            let match_end = match_start + pattern.len();

            if self.whole_word {
                if is_word_boundary(text, match_start, match_end) {
                    matches.push(Match {
                        start: match_start,
                        end: match_end,
                        text: text[match_start..match_end].to_string(),
                    });
                }
            } else {
                matches.push(Match {
                    start: match_start,
                    end: match_end,
                    text: text[match_start..match_end].to_string(),
                });
            }

            start = match_end;
        }

        matches
    }
}

impl Matcher for PlainMatcher {
    fn matches(&self, text: &str) -> Vec<Match> {
        self.find_matches(text)
    }

    fn find_all(&self, text: &str) -> Vec<Match> {
        self.find_matches(text)
    }
}

/// Regex matcher
pub struct RegexMatcher {
    regex: Regex,
}

impl RegexMatcher {
    pub fn new(pattern: &str) -> SearchResult<Self> {
        let regex = Regex::new(pattern)?;
        Ok(Self { regex })
    }

    pub fn with_options(pattern: &str, case_insensitive: bool) -> SearchResult<Self> {
        let regex = if case_insensitive {
            Regex::new(&format!("(?i){}", pattern))?
        } else {
            Regex::new(pattern)?
        };
        Ok(Self { regex })
    }
}

impl Matcher for RegexMatcher {
    fn matches(&self, text: &str) -> Vec<Match> {
        self.find_all(text)
    }

    fn find_all(&self, text: &str) -> Vec<Match> {
        self.regex
            .find_iter(text)
            .map(|m| Match {
                start: m.start(),
                end: m.end(),
                text: m.as_str().to_string(),
            })
            .collect()
    }
}

/// Match result
#[derive(Debug, Clone)]
pub struct Match {
    pub start: usize,
    pub end: usize,
    pub text: String,
}

impl Match {
    pub fn new(start: usize, end: usize, text: impl Into<String>) -> Self {
        Self {
            start,
            end,
            text: text.into(),
        }
    }

    pub fn len(&self) -> usize {
        self.end - self.start
    }

    pub fn is_empty(&self) -> bool {
        self.start == self.end
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plain_matcher() {
        let matcher = PlainMatcher::new("test");
        let text = "this is a test string";
        let matches = matcher.find_all(text);

        assert_eq!(matches.len(), 1);
        assert_eq!(matches[0].text, "test");
    }

    #[test]
    fn test_plain_matcher_case_sensitive() {
        let matcher = PlainMatcher::new("Test").with_case_sensitive(true);
        let text = "this is a Test string";
        let matches = matcher.find_all(text);

        assert_eq!(matches.len(), 1);
    }

    #[test]
    fn test_plain_matcher_whole_word() {
        let matcher = PlainMatcher::new("test").with_whole_word(true);
        let text = "test tester testing";
        let matches = matcher.find_all(text);

        assert_eq!(matches.len(), 1);
    }

    #[test]
    fn test_regex_matcher() {
        let matcher = RegexMatcher::new(r"\d+").unwrap();
        let text = "test 123 test 456";
        let matches = matcher.find_all(text);

        assert_eq!(matches.len(), 2);
        assert_eq!(matches[0].text, "123");
        assert_eq!(matches[1].text, "456");
    }
}
