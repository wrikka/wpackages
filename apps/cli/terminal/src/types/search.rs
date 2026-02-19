use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum SearchDirection {
    Forward,
    Backward,
}

impl Default for SearchDirection {
    fn default() -> Self {
        Self::Forward
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum SearchMatchType {
    Exact,
    CaseInsensitive,
    Regex,
    Fuzzy,
}

impl Default for SearchMatchType {
    fn default() -> Self {
        Self::CaseInsensitive
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SearchQuery {
    pub query: String,
    pub direction: SearchDirection,
    pub match_type: SearchMatchType,
    pub case_sensitive: bool,
    pub whole_word: bool,
    pub use_regex: bool,
}

impl Default for SearchQuery {
    fn default() -> Self {
        Self {
            query: String::new(),
            direction: SearchDirection::default(),
            match_type: SearchMatchType::default(),
            case_sensitive: false,
            whole_word: false,
            use_regex: false,
        }
    }
}

impl SearchQuery {
    pub fn new(query: String) -> Self {
        Self {
            query,
            ..Default::default()
        }
    }

    pub fn with_direction(mut self, direction: SearchDirection) -> Self {
        self.direction = direction;
        self
    }

    pub fn with_match_type(mut self, match_type: SearchMatchType) -> Self {
        self.match_type = match_type;
        self
    }

    pub fn with_case_sensitive(mut self, case_sensitive: bool) -> Self {
        self.case_sensitive = case_sensitive;
        self
    }

    pub fn with_whole_word(mut self, whole_word: bool) -> Self {
        self.whole_word = whole_word;
        self
    }

    pub fn with_regex(mut self, use_regex: bool) -> Self {
        self.use_regex = use_regex;
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SearchMatch {
    pub line: usize,
    pub start_col: usize,
    pub end_col: usize,
    pub matched_text: String,
    pub context_before: Option<String>,
    pub context_after: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SearchResult {
    pub matches: Vec<SearchMatch>,
    pub total_matches: usize,
    pub current_index: usize,
    pub query: SearchQuery,
}

impl Default for SearchResult {
    fn default() -> Self {
        Self {
            matches: vec![],
            total_matches: 0,
            current_index: 0,
            query: SearchQuery::default(),
        }
    }
}

impl SearchResult {
    pub fn new(query: SearchQuery) -> Self {
        Self {
            query,
            ..Default::default()
        }
    }

    pub fn add_match(&mut self, match_: SearchMatch) {
        self.matches.push(match_);
        self.total_matches = self.matches.len();
    }

    pub fn get_current_match(&self) -> Option<&SearchMatch> {
        self.matches.get(self.current_index)
    }

    pub fn next_match(&mut self) -> Option<&SearchMatch> {
        if self.matches.is_empty() {
            return None;
        }
        self.current_index = (self.current_index + 1) % self.matches.len();
        self.get_current_match()
    }

    pub fn previous_match(&mut self) -> Option<&SearchMatch> {
        if self.matches.is_empty() {
            return None;
        }
        self.current_index = if self.current_index == 0 {
            self.matches.len() - 1
        } else {
            self.current_index - 1
        };
        self.get_current_match()
    }

    pub fn clear(&mut self) {
        self.matches.clear();
        self.total_matches = 0;
        self.current_index = 0;
    }

    pub fn has_matches(&self) -> bool {
        !self.matches.is_empty()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SearchState {
    pub is_active: bool,
    pub query: SearchQuery,
    pub result: SearchResult,
    pub highlight_all: bool,
}

impl Default for SearchState {
    fn default() -> Self {
        Self {
            is_active: false,
            query: SearchQuery::default(),
            result: SearchResult::default(),
            highlight_all: true,
        }
    }
}

impl SearchState {
    pub fn activate(&mut self, query: SearchQuery) {
        self.is_active = true;
        self.query = query.clone();
        self.result = SearchResult::new(query);
    }

    pub fn deactivate(&mut self) {
        self.is_active = false;
    }

    pub fn toggle(&mut self) {
        self.is_active = !self.is_active;
    }

    pub fn update_query(&mut self, query: SearchQuery) {
        self.query = query.clone();
        self.result = SearchResult::new(query);
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ReplaceQuery {
    pub search: SearchQuery,
    pub replacement: String,
    pub replace_all: bool,
    pub confirm_each: bool,
}

impl Default for ReplaceQuery {
    fn default() -> Self {
        Self {
            search: SearchQuery::default(),
            replacement: String::new(),
            replace_all: false,
            confirm_each: true,
        }
    }
}

impl ReplaceQuery {
    pub fn new(search: SearchQuery, replacement: String) -> Self {
        Self {
            search,
            replacement,
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ReplaceResult {
    pub replacements_made: usize,
    pub total_matches: usize,
    pub replaced_matches: Vec<SearchMatch>,
}

impl Default for ReplaceResult {
    fn default() -> Self {
        Self {
            replacements_made: 0,
            total_matches: 0,
            replaced_matches: vec![],
        }
    }
}
