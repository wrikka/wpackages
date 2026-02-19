use lsp_types::{Position, Range, Url};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Navigation target
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationTarget {
    pub uri: Url,
    pub range: Range,
    pub kind: NavigationKind,
}

impl NavigationTarget {
    pub fn new(uri: Url, range: Range) -> Self {
        Self {
            uri,
            range,
            kind: NavigationKind::Unknown,
        }
    }

    pub fn with_kind(mut self, kind: NavigationKind) -> Self {
        self.kind = kind;
        self
    }

    pub fn position(&self) -> Position {
        self.range.start
    }
}

/// Navigation kind
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum NavigationKind {
    Unknown,
    Definition,
    TypeDefinition,
    Implementation,
    Reference,
    Declaration,
}

/// Navigation history entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationHistoryEntry {
    pub target: NavigationTarget,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub context: Option<String>,
}

impl NavigationHistoryEntry {
    pub fn new(target: NavigationTarget) -> Self {
        Self {
            target,
            timestamp: chrono::Utc::now(),
            context: None,
        }
    }

    pub fn with_context(mut self, context: impl Into<String>) -> Self {
        self.context = Some(context.into());
        self
    }
}

/// Navigation history
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationHistory {
    entries: Vec<NavigationHistoryEntry>,
    current_index: usize,
    max_size: usize,
}

impl NavigationHistory {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            current_index: 0,
            max_size: 100,
        }
    }

    pub fn with_max_size(max_size: usize) -> Self {
        Self {
            entries: Vec::new(),
            current_index: 0,
            max_size,
        }
    }

    pub fn push(&mut self, entry: NavigationHistoryEntry) {
        // Remove entries after current position
        if self.current_index < self.entries.len() {
            self.entries.truncate(self.current_index);
        }

        self.entries.push(entry);
        self.current_index = self.entries.len();

        // Limit history size
        if self.entries.len() > self.max_size {
            self.entries.remove(0);
            self.current_index -= 1;
        }
    }

    pub fn go_back(&mut self) -> Option<&NavigationHistoryEntry> {
        if self.current_index > 0 {
            self.current_index -= 1;
            self.entries.get(self.current_index)
        } else {
            None
        }
    }

    pub fn go_forward(&mut self) -> Option<&NavigationHistoryEntry> {
        if self.current_index < self.entries.len() - 1 {
            self.current_index += 1;
            self.entries.get(self.current_index)
        } else {
            None
        }
    }

    pub fn current(&self) -> Option<&NavigationHistoryEntry> {
        self.entries.get(self.current_index)
    }

    pub fn can_go_back(&self) -> bool {
        self.current_index > 0
    }

    pub fn can_go_forward(&self) -> bool {
        self.current_index < self.entries.len() - 1
    }

    pub fn entries(&self) -> &[NavigationHistoryEntry] {
        &self.entries
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.current_index = 0;
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

impl Default for NavigationHistory {
    fn default() -> Self {
        Self::new()
    }
}

/// Navigation bookmarks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationBookmarks {
    bookmarks: HashMap<String, NavigationTarget>,
}

impl NavigationBookmarks {
    pub fn new() -> Self {
        Self {
            bookmarks: HashMap::new(),
        }
    }

    pub fn add(&mut self, name: impl Into<String>, target: NavigationTarget) {
        self.bookmarks.insert(name.into(), target);
    }

    pub fn remove(&mut self, name: &str) -> Option<NavigationTarget> {
        self.bookmarks.remove(name)
    }

    pub fn get(&self, name: &str) -> Option<&NavigationTarget> {
        self.bookmarks.get(name)
    }

    pub fn get_mut(&mut self, name: &str) -> Option<&mut NavigationTarget> {
        self.bookmarks.get_mut(name)
    }

    pub fn contains(&self, name: &str) -> bool {
        self.bookmarks.contains_key(name)
    }

    pub fn names(&self) -> Vec<String> {
        self.bookmarks.keys().cloned().collect()
    }

    pub fn count(&self) -> usize {
        self.bookmarks.len()
    }

    pub fn is_empty(&self) -> bool {
        self.bookmarks.is_empty()
    }

    pub fn clear(&mut self) {
        self.bookmarks.clear();
    }
}

impl Default for NavigationBookmarks {
    fn default() -> Self {
        Self::new()
    }
}

/// Navigation options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationOptions {
    pub include_declarations: bool,
    pub include_type_definitions: bool,
    pub include_implementations: bool,
    pub limit: Option<usize>,
}

impl NavigationOptions {
    pub fn new() -> Self {
        Self {
            include_declarations: true,
            include_type_definitions: true,
            include_implementations: true,
            limit: None,
        }
    }

    pub fn with_limit(mut self, limit: usize) -> Self {
        self.limit = Some(limit);
        self
    }

    pub fn without_declarations(mut self) -> Self {
        self.include_declarations = false;
        self
    }

    pub fn without_type_definitions(mut self) -> Self {
        self.include_type_definitions = false;
        self
    }

    pub fn without_implementations(mut self) -> Self {
        self.include_implementations = false;
        self
    }
}

impl Default for NavigationOptions {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_navigation_history() {
        let mut history = NavigationHistory::new();
        let target = NavigationTarget::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        );

        history.push(NavigationHistoryEntry::new(target.clone()));
        assert_eq!(history.len(), 1);
        assert!(!history.can_go_back());
        assert!(!history.can_go_forward());

        history.push(NavigationHistoryEntry::new(target));
        assert_eq!(history.len(), 2);
        assert!(history.can_go_back());
        assert!(!history.can_go_forward());

        history.go_back();
        assert!(history.can_go_back());
        assert!(history.can_go_forward());
    }

    #[test]
    fn test_navigation_bookmarks() {
        let mut bookmarks = NavigationBookmarks::new();
        let target = NavigationTarget::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        );

        bookmarks.add("test", target.clone());
        assert_eq!(bookmarks.count(), 1);
        assert!(bookmarks.contains("test"));

        let retrieved = bookmarks.get("test");
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().uri, target.uri);

        bookmarks.remove("test");
        assert_eq!(bookmarks.count(), 0);
        assert!(!bookmarks.contains("test"));
    }
}
