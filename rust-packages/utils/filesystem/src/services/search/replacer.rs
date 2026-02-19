use crate::search::error::{SearchError, SearchResult};
use crate::search::types::{PreviewChange, ReplaceOptions, ReplaceResult};
use crate::search::utils::{is_word_boundary, normalize_case};
use regex::Regex;
use std::path::PathBuf;

/// Replacer for search and replace operations
pub struct Replacer {
    pattern: String,
    replacement: String,
    options: ReplaceOptions,
}

impl Replacer {
    pub fn new(pattern: impl Into<String>, replacement: impl Into<String>) -> Self {
        Self {
            pattern: pattern.into(),
            replacement: replacement.into(),
            options: ReplaceOptions::new(),
        }
    }

    pub fn with_options(mut self, options: ReplaceOptions) -> Self {
        self.options = options;
        self
    }

    pub fn replace(&self, text: &str) -> SearchResult<String> {
        if self.options.regex_mode {
            self.replace_regex(text)
        } else {
            self.replace_plain(text)
        }
    }

    fn replace_plain(&self, text: &str) -> SearchResult<String> {
        let (search_text, pattern) =
            normalize_case(text, &self.pattern, self.options.case_sensitive);

        let mut result = text.to_string();
        let mut offset = 0;

        while let Some(pos) = search_text[offset..].find(&pattern) {
            let match_start = offset + pos;
            let match_end = match_start + pattern.len();

            if self.options.whole_word {
                if is_word_boundary(text, match_start, match_end) {
                    result.replace_range(match_start..match_end, &self.replacement);
                }
            } else {
                result.replace_range(match_start..match_end, &self.replacement);
            }

            offset = match_end;
        }

        Ok(result)
    }

    fn replace_regex(&self, text: &str) -> SearchResult<String> {
        let regex = Regex::new(&self.pattern)?;
        let result = regex.replace_all(text, &self.replacement).to_string();
        Ok(result)
    }

    pub fn replace_with_preview(&self, text: &str) -> SearchResult<ReplaceResult> {
        let mut result = ReplaceResult::new();

        if self.options.regex_mode {
            self.replace_regex_with_preview(text, &mut result)?;
        } else {
            self.replace_plain_with_preview(text, &mut result)?;
        }

        Ok(result)
    }

    fn replace_plain_with_preview(
        &self,
        text: &str,
        result: &mut ReplaceResult,
    ) -> SearchResult<()> {
        let lines: Vec<&str> = text.lines().collect();
        let mut modified_lines = Vec::new();

        for (line_idx, line) in lines.iter().enumerate() {
            let (search_text, pattern) =
                normalize_case(line, &self.pattern, self.options.case_sensitive);

            let mut modified_line = line.to_string();
            let mut replaced = false;
            let mut offset = 0;

            while let Some(pos) = search_text[offset..].find(&pattern) {
                let match_start = offset + pos;
                let match_end = match_start + pattern.len();

                if self.options.whole_word {
                    if is_word_boundary(line, match_start, match_end) {
                        modified_line.replace_range(match_start..match_end, &self.replacement);
                        replaced = true;
                        result.add_replacement();
                    }
                } else {
                    modified_line.replace_range(match_start..match_end, &self.replacement);
                    replaced = true;
                    result.add_replacement();
                }

                offset = match_end;
            }

            if replaced {
                result.add_file();
                result.preview_changes.push(PreviewChange::new(
                    PathBuf::from("<buffer>"),
                    line_idx + 1,
                    line.to_string(),
                    modified_line.clone(),
                ));
            }

            modified_lines.push(modified_line);
        }

        Ok(())
    }

    fn replace_regex_with_preview(
        &self,
        text: &str,
        result: &mut ReplaceResult,
    ) -> SearchResult<()> {
        let regex = Regex::new(&self.pattern)?;
        let lines: Vec<&str> = text.lines().collect();

        for (line_idx, line) in lines.iter().enumerate() {
            let modified_line = regex.replace_all(line, &self.replacement).to_string();

            if modified_line != *line {
                result.add_file();
                result.add_replacement();
                result.preview_changes.push(PreviewChange::new(
                    PathBuf::from("<buffer>"),
                    line_idx + 1,
                    line.to_string(),
                    modified_line,
                ));
            }
        }

        Ok(())
    }
}

/// Replacer result
pub type ReplacerResult = Result<String, SearchError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_replacer_plain() {
        let replacer = Replacer::new("test", "TEST");
        let text = "this is a test string";
        let result = replacer.replace(text).unwrap();

        assert_eq!(result, "this is a TEST string");
    }

    #[test]
    fn test_replacer_regex() {
        let replacer = Replacer::new(r"\d+", "NUM");
        let text = "test 123 test 456";
        let result = replacer.replace(text).unwrap();

        assert_eq!(result, "test NUM test NUM");
    }

    #[test]
    fn test_replacer_whole_word() {
        let replacer =
            Replacer::new("test", "TEST").with_options(ReplaceOptions::new().with_whole_word(true));
        let text = "test tester testing";
        let result = replacer.replace(text).unwrap();

        assert_eq!(result, "TEST tester testing");
    }

    #[test]
    fn test_replacer_preview() {
        let replacer = Replacer::new("test", "TEST");
        let text = "this is a test string";
        let result = replacer.replace_with_preview(text).unwrap();

        assert_eq!(result.replaced_count, 1);
        assert_eq!(result.preview_changes.len(), 1);
    }
}
