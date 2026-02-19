//! Tests for symbol functionality.
//!
//! This module contains unit tests for symbol types and operations.

use super::filter::SymbolFilter;
use super::sort::SymbolSortBy;
use super::types::{Symbol, SymbolLocation};
use lsp_types::{Position, Range, SymbolKind, Url};

#[test]
fn test_symbol_creation() {
    let location = SymbolLocation::new(
        Url::parse("file:///test.rs").unwrap(),
        Range::new(Position::new(0, 0), Position::new(0, 10)),
    );

    let symbol = Symbol::new("test", SymbolKind::FUNCTION, location.clone())
        .with_container_name("MyClass")
        .with_detail("fn test() -> i32")
        .with_deprecated(false);

    assert_eq!(symbol.name, "test");
    assert!(symbol.is_function());
    assert_eq!(symbol.container_name, Some("MyClass".to_string()));
    assert_eq!(symbol.detail, Some("fn test() -> i32".to_string()));
}

#[test]
fn test_symbol_filter() {
    let filter = SymbolFilter::new("test")
        .with_kinds(vec![SymbolKind::FUNCTION, SymbolKind::CLASS])
        .with_deprecated(false);

    let location = SymbolLocation::new(
        Url::parse("file:///test.rs").unwrap(),
        Range::new(Position::new(0, 0), Position::new(0, 10)),
    );

    let symbol = Symbol::new("testFunction", SymbolKind::FUNCTION, location.clone());
    assert!(filter.matches(&symbol));

    let deprecated_symbol = Symbol::new("testFunction", SymbolKind::FUNCTION, location.clone())
        .with_deprecated(true);
    assert!(!filter.matches(&deprecated_symbol));
}

#[test]
fn test_symbol_sort() {
    let mut symbols = vec![
        Symbol::new(
            "b",
            SymbolKind::FUNCTION,
            SymbolLocation::new(
                Url::parse("file:///test.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
        ),
        Symbol::new(
            "a",
            SymbolKind::CLASS,
            SymbolLocation::new(
                Url::parse("file:///test.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
        ),
        Symbol::new(
            "c",
            SymbolKind::FUNCTION,
            SymbolLocation::new(
                Url::parse("file:///test.rs").unwrap(),
                Range::new(Position::new(0, 0), Position::new(0, 10)),
            ),
        ),
    ];

    SymbolSortBy::Name.sort(&mut symbols);
    assert_eq!(symbols[0].name, "a");
    assert_eq!(symbols[1].name, "b");
    assert_eq!(symbols[2].name, "c");
}
