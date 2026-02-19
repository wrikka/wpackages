//! Search Components
//!
//! Pure functions สำหรับ search logic

use std::collections::HashMap;

/// Normalize search term
pub fn normalize_search_term(term: &str) -> String {
    term.trim()
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Build search query parameters from raw input
pub fn build_search_query(params: HashMap<String, String>) -> SearchParams {
    let query = params.get("q").map(|q| normalize_search_term(q));
    let category = params.get("category").cloned();
    let limit = params
        .get("limit")
        .and_then(|l| l.parse().ok())
        .unwrap_or(20)
        .min(100);
    let offset = params
        .get("offset")
        .and_then(|o| o.parse().ok())
        .unwrap_or(0);

    SearchParams {
        query,
        category,
        limit,
        offset,
    }
}

#[derive(Debug, Clone)]
pub struct SearchParams {
    pub query: Option<String>,
    pub category: Option<String>,
    pub limit: usize,
    pub offset: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_search_term() {
        assert_eq!(normalize_search_term("  Hello  World  "), "hello world");
        assert_eq!(normalize_search_term("TEST"), "test");
        assert_eq!(normalize_search_term(""), "");
    }

    #[test]
    fn test_build_search_query() {
        let mut params = HashMap::new();
        params.insert("q".to_string(), "  Test  ".to_string());
        params.insert("limit".to_string(), "50".to_string());

        let result = build_search_query(params);

        assert_eq!(result.query, Some("test".to_string()));
        assert_eq!(result.limit, 50);
        assert_eq!(result.offset, 0);
    }

    #[test]
    fn test_build_search_query_defaults() {
        let params = HashMap::new();
        let result = build_search_query(params);

        assert_eq!(result.query, None);
        assert_eq!(result.limit, 20);
        assert_eq!(result.offset, 0);
    }

    #[test]
    fn test_build_search_query_limit_cap() {
        let mut params = HashMap::new();
        params.insert("limit".to_string(), "200".to_string());

        let result = build_search_query(params);

        assert_eq!(result.limit, 100);
    }
}
