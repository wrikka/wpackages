#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Selection {
    pub start_line: usize,
    pub start_col: usize,
    pub end_line: usize,
    pub end_col: usize,
}

impl Selection {
    pub fn new(start_line: usize, start_col: usize, end_line: usize, end_col: usize) -> Self {
        Self {
            start_line,
            start_col,
            end_line,
            end_col,
        }
    }

    pub fn is_empty(&self) -> bool {
        self.start_line == self.end_line && self.start_col == self.end_col
    }

    pub fn contains(&self, line: usize, col: usize) -> bool {
        if line < self.start_line || line > self.end_line {
            return false;
        }
        if line == self.start_line && col < self.start_col {
            return false;
        }
        if line == self.end_line && col > self.end_col {
            return false;
        }
        true
    }

    pub fn merge(&self, other: &Selection) -> Selection {
        let start_line = self.start_line.min(other.start_line);
        let start_col = if start_line == self.start_line {
            self.start_col.min(other.start_col)
        } else if start_line == other.start_line {
            self.start_col.max(other.start_col)
        } else {
            self.start_col
        };
        let end_line = self.end_line.max(other.end_line);
        let end_col = if end_line == self.end_line {
            self.end_col.max(other.end_col)
        } else if end_line == other.end_line {
            self.end_col.min(other.end_col)
        } else {
            self.end_col
        };
        Selection::new(start_line, start_col, end_line, end_col)
    }
}

#[derive(Debug, Clone)]
pub struct MultiSelection {
    selections: Vec<Selection>,
    primary_index: usize,
}

impl MultiSelection {
    pub fn new() -> Self {
        Self {
            selections: Vec::new(),
            primary_index: 0,
        }
    }

    pub fn add_selection(&mut self, selection: Selection) {
        self.selections.push(selection);
    }

    pub fn remove_selection(&mut self, index: usize) {
        if index < self.selections.len() {
            self.selections.remove(index);
            if self.primary_index >= self.selections.len() && !self.selections.is_empty() {
                self.primary_index = self.selections.len() - 1;
            }
        }
    }

    pub fn clear(&mut self) {
        self.selections.clear();
        self.primary_index = 0;
    }

    pub fn selections(&self) -> &[Selection] {
        &self.selections
    }

    pub fn primary_selection(&self) -> Option<&Selection> {
        self.selections.get(self.primary_index)
    }

    pub fn set_primary_selection(&mut self, index: usize) {
        if index < self.selections.len() {
            self.primary_index = index;
        }
    }

    pub fn merge_overlapping(&mut self) {
        let mut merged: Vec<Selection> = Vec::new();
        let mut sorted: Vec<_> = self.selections.clone();
        sorted.sort_by(|a, b| (a.start_line, a.start_col).cmp(&(b.start_line, b.start_col)));

        for selection in sorted {
            if let Some(last) = merged.last_mut() {
                if last.end_line > selection.start_line
                    || (last.end_line == selection.start_line
                        && last.end_col >= selection.start_col)
                {
                    *last = last.merge(&selection);
                } else {
                    merged.push(selection);
                }
            } else {
                merged.push(selection);
            }
        }

        self.selections = merged;
    }

    pub fn select_word(&mut self, line: usize, col: usize, content: &str) {
        self.clear();

        if let Some(line_content) = content.lines().nth(line) {
            let chars: Vec<char> = line_content.chars().collect();

            let mut start = col;
            while start > 0
                && chars
                    .get(start - 1)
                    .is_some_and(|c| c.is_alphanumeric() || *c == '_')
            {
                start -= 1;
            }

            let mut end = col;
            while end < chars.len()
                && chars
                    .get(end)
                    .is_some_and(|c| c.is_alphanumeric() || *c == '_')
            {
                end += 1;
            }

            self.add_selection(Selection::new(line, start, line, end));
        }
    }

    pub fn select_all_occurrences(&mut self, line: usize, col: usize, content: &str) {
        self.select_word(line, col, content);

        let primary = self.primary_selection();

        if let Some(primary) = primary {
            let primary_start_col = primary.start_col;
            let primary_end_col = primary.end_col;

            if let Some(line_content) = content.lines().nth(line) {
                let word: String = line_content
                    .chars()
                    .skip(primary_start_col)
                    .take(primary_end_col - primary_start_col)
                    .collect();

                if !word.is_empty() {
                    for (line_idx, line_content) in content.lines().enumerate() {
                        let mut start = 0;
                        while let Some(pos) = line_content[start..].find(&word) {
                            let actual_pos = start + pos;
                            let chars: Vec<char> = line_content.chars().collect();
                            let word_start = actual_pos;
                            let word_end = actual_pos + word.len();

                            if (line_idx != line || word_start != primary_start_col)
                                && chars
                                    .get(word_start)
                                    .is_some_and(|c| c.is_alphanumeric() || *c == '_')
                                && chars
                                    .get(word_end - 1)
                                    .is_some_and(|c| c.is_alphanumeric() || *c == '_')
                            {
                                self.add_selection(Selection::new(
                                    line_idx, word_start, line_idx, word_end,
                                ));
                            }
                            start = word_end;
                        }
                    }
                }
            }
        }
    }

    pub fn select_line(&mut self, line: usize, content: &str) {
        self.clear();

        if let Some(line_content) = content.lines().nth(line) {
            self.add_selection(Selection::new(line, 0, line, line_content.len()));
        }
    }

    pub fn select_all_lines(&mut self, content: &str) {
        self.clear();

        for (line_idx, line_content) in content.lines().enumerate() {
            self.add_selection(Selection::new(line_idx, 0, line_idx, line_content.len()));
        }
    }

    pub fn expand_selection(&mut self, line: usize, col: usize, content: &str) {
        if self.selections.is_empty() {
            self.select_word(line, col, content);
            return;
        }

        let mut new_selections = Vec::new();

        for selection in &self.selections {
            let new_selection = self.expand_one(selection, content);
            new_selections.push(new_selection);
        }

        self.selections = new_selections;
    }

    fn expand_one(&self, selection: &Selection, content: &str) -> Selection {
        let line_content = if let Some(line) = content.lines().nth(selection.start_line) {
            line
        } else {
            return selection.clone();
        };

        let chars: Vec<char> = line_content.chars().collect();

        let mut start = selection.start_col;
        let mut end = selection.end_col;

        while start > 0 && chars.get(start - 1).is_some_and(|c| c.is_whitespace()) {
            start -= 1;
        }

        while start > 0 && chars.get(start - 1).is_some_and(|c| !c.is_whitespace()) {
            start -= 1;
        }

        while end < chars.len() && chars.get(end).is_some_and(|c| c.is_whitespace()) {
            end += 1;
        }

        while end < chars.len() && chars.get(end).is_some_and(|c| !c.is_whitespace()) {
            end += 1;
        }

        Selection::new(selection.start_line, start, selection.end_line, end)
    }

    pub fn shrink_selection(&mut self, line: usize, _col: usize, content: &str) {
        if self.selections.len() == 1 {
            let selection = &self.selections[0];

            if selection.start_line == selection.end_line
                && selection.start_col != selection.end_col
            {
                let line_content = if let Some(line) = content.lines().nth(line) {
                    line
                } else {
                    return;
                };

                let _chars: Vec<char> = line_content.chars().collect();
                let word_start = selection.start_col;
                let word_end = selection.end_col;

                if word_start + 1 < word_end {
                    self.clear();
                    self.add_selection(Selection::new(line, word_start + 1, line, word_end - 1));
                }
            }
        }
    }
}

impl Default for MultiSelection {
    fn default() -> Self {
        Self::new()
    }
}
