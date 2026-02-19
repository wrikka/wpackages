use lsp_types::{Position, Range, Url};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

/// Reference to a symbol
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reference {
    pub uri: Url,
    pub range: Range,
    pub kind: ReferenceKind,
}

impl Reference {
    pub fn new(uri: Url, range: Range) -> Self {
        Self {
            uri,
            range,
            kind: ReferenceKind::Read,
        }
    }

    pub fn with_kind(mut self, kind: ReferenceKind) -> Self {
        self.kind = kind;
        self
    }

    pub fn position(&self) -> Position {
        self.range.start
    }

    pub fn is_write(&self) -> bool {
        matches!(
            self.kind,
            ReferenceKind::Write | ReferenceKind::ReadWrite | ReferenceKind::Delete
        )
    }

    pub fn is_definition(&self) -> bool {
        matches!(self.kind, ReferenceKind::Definition)
    }
}

/// Reference kind
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ReferenceKind {
    Read,
    Write,
    Definition,
    Declaration,
    ReadWrite,
    Delete,
}

/// Reference location
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceLocation {
    pub uri: Url,
    pub range: Range,
    pub line: usize,
    pub column: usize,
}

impl ReferenceLocation {
    pub fn new(uri: Url, range: Range) -> Self {
        Self {
            uri,
            range,
            line: range.start.line as usize,
            column: range.start.character as usize,
        }
    }

    pub fn position(&self) -> Position {
        Position::new(self.line as u32, self.column as u32)
    }
}

/// Reference search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceSearchResult {
    pub references: Vec<Reference>,
    pub total_count: usize,
    pub is_incomplete: bool,
}

impl ReferenceSearchResult {
    pub fn new(references: Vec<Reference>, is_incomplete: bool) -> Self {
        let total_count = references.len();
        Self {
            references,
            total_count,
            is_incomplete,
        }
    }
}

/// Reference filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReferenceFilter {
    pub include_declarations: bool,
    pub include_definitions: bool,
    pub kinds: Vec<ReferenceKind>,
}

impl ReferenceFilter {
    pub fn new() -> Self {
        Self {
            include_declarations: true,
            include_definitions: true,
            kinds: Vec::new(),
        }
    }

    pub fn with_declarations(mut self, include: bool) -> Self {
        self.include_declarations = include;
        self
    }

    pub fn with_definitions(mut self, include: bool) -> Self {
        self.include_definitions = include;
        self
    }

    pub fn with_kinds(mut self, kinds: Vec<ReferenceKind>) -> Self {
        self.kinds = kinds;
        self
    }

    pub fn matches(&self, reference: &Reference) -> bool {
        // Check kinds
        if !self.kinds.is_empty() && !self.kinds.contains(&reference.kind) {
            return false;
        }

        true
    }
}

impl Default for ReferenceFilter {
    fn default() -> Self {
        Self::new()
    }
}

/// Reference sorter
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ReferenceSortBy {
    Location,
    Kind,
    Uri,
}

impl ReferenceSortBy {
    pub fn sort(&self, references: &mut [Reference]) {
        match self {
            ReferenceSortBy::Location => {
                references.sort_by(|a, b| match a.uri.as_str().cmp(b.uri.as_str()) {
                    Ordering::Equal => {
                        let a_pos = a.position();
                        let b_pos = b.position();
                        match a_pos.line.cmp(&b_pos.line) {
                            Ordering::Equal => a_pos.character.cmp(&b_pos.character),
                            other => other,
                        }
                    }
                    other => other,
                });
            }
            ReferenceSortBy::Kind => {
                references.sort_by(|a, b| {
                    // ReferenceKind is an enum, compare using discriminant
                    use std::mem::discriminant;
                    let da = discriminant(&a.kind);
                    let db = discriminant(&b.kind);
                    // Discriminant implements PartialEq
                    if da == db {
                        a.uri.as_str().cmp(b.uri.as_str())
                    } else {
                        // Discriminant doesn't implement Ord, so we use unsafe to compare
                        // This is safe because discriminant is just an integer value
                        // We use u64 which is the actual size of discriminant
                        unsafe {
                            let da_int = std::mem::transmute::<
                                std::mem::Discriminant<ReferenceKind>,
                                u64,
                            >(da);
                            let db_int = std::mem::transmute::<
                                std::mem::Discriminant<ReferenceKind>,
                                u64,
                            >(db);
                            da_int.cmp(&db_int)
                        }
                    }
                });
            }
            ReferenceSortBy::Uri => {
                references.sort_by(|a, b| match a.uri.as_str().cmp(b.uri.as_str()) {
                    Ordering::Equal => {
                        let a_pos = a.position();
                        let b_pos = b.position();
                        match a_pos.line.cmp(&b_pos.line) {
                            Ordering::Equal => a_pos.character.cmp(&b_pos.character),
                            other => other,
                        }
                    }
                    other => other,
                });
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reference_creation() {
        let reference = Reference::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        )
        .with_kind(ReferenceKind::Read);

        assert_eq!(reference.kind, ReferenceKind::Read);
        assert!(!reference.is_write());
    }

    #[test]
    fn test_reference_filter() {
        let filter =
            ReferenceFilter::new().with_kinds(vec![ReferenceKind::Read, ReferenceKind::Write]);

        let reference = Reference::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        )
        .with_kind(ReferenceKind::Read);

        assert!(filter.matches(&reference));

        let write_reference = Reference::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        )
        .with_kind(ReferenceKind::Write);

        assert!(filter.matches(&write_reference));

        let def_reference = Reference::new(
            Url::parse("file:///test.rs").unwrap(),
            Range::new(Position::new(0, 0), Position::new(0, 10)),
        )
        .with_kind(ReferenceKind::Definition);

        assert!(!filter.matches(&def_reference));
    }

    #[test]
    fn test_reference_sort() {
        let mut references = vec![
            Reference::new(
                Url::parse("file:///c.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
            Reference::new(
                Url::parse("file:///a.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
            Reference::new(
                Url::parse("file:///b.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
        ];

        ReferenceSortBy::Uri.sort(&mut references);
        assert_eq!(references[0].uri.as_str(), "file:///a.rs");
        assert_eq!(references[1].uri.as_str(), "file:///b.rs");
        assert_eq!(references[2].uri.as_str(), "file:///c.rs");
    }
}
