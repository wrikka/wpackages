#![cfg(test)]
use super::tokenizer::Tokenizer;
use crate::app::index::Index;
use crate::types::document::Document;
use rustc_hash::FxHashMap;

#[test]
fn test_tokenizer() {
    let tokenizer = Tokenizer::new();
    let text = "Hello, World! This is a TEST.";
    let tokens: Vec<_> = tokenizer.tokenize(text).collect();
    assert_eq!(tokens, vec!["hello", "world", "this", "is", "a", "test"]);
}

#[test]
fn test_index_and_search() {
    let mut index = Index::new();
    let docs = vec![
        Document {
            id: 0,
            fields: FxHashMap::from_iter(vec![("title".to_string(), "Rust is fast".to_string())]),
        },
        Document {
            id: 0,
            fields: FxHashMap::from_iter(vec![("title".to_string(), "Hello world".to_string())]),
        },
    ];
    index.add_documents(docs);
    index.build();

    let results = index.search("rust");
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].fields.get("title").unwrap(), "Rust is fast");

    let results = index.search("world");
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].fields.get("title").unwrap(), "Hello world");

    let results = index.search("noexist");
    assert_eq!(results.len(), 0);
}
