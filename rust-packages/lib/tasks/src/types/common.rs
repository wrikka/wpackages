//! Common types for the task system
//!
//! Provides timestamp handling, metadata tracking, and pagination support.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Timestamp wrapper using UTC
pub type Timestamp = DateTime<Utc>;

/// Create a new timestamp with current UTC time
pub fn now() -> Timestamp {
    Utc::now()
}

/// Metadata for entities with tracking information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
    pub version: u64,
}

impl Default for Metadata {
    fn default() -> Self {
        let now = now();
        Self {
            created_at: now,
            updated_at: now,
            version: 1,
        }
    }
}

impl Metadata {
    /// Create new metadata with current timestamp
    pub fn new() -> Self {
        Self::default()
    }

    /// Update the metadata timestamp and increment version
    pub fn touch(&mut self) {
        self.updated_at = now();
        self.version += 1;
    }
}

/// Pagination parameters for list operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: u64,
    pub per_page: u64,
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 20,
        }
    }
}

impl Pagination {
    /// Create new pagination with specified page and items per page
    pub fn new(page: u64, per_page: u64) -> Self {
        Self { page, per_page }
    }

    /// Calculate the offset for database queries
    pub fn offset(&self) -> u64 {
        (self.page.saturating_sub(1)) * self.per_page
    }
}

/// Paginated result wrapper for list responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Paginated<T> {
    pub items: Vec<T>,
    pub total: u64,
    pub page: u64,
    pub per_page: u64,
    pub total_pages: u64,
}

impl<T> Paginated<T> {
    /// Create a new paginated result
    pub fn new(items: Vec<T>, total: u64, pagination: &Pagination) -> Self {
        let total_pages = (total + pagination.per_page - 1) / pagination.per_page;
        Self {
            items,
            total,
            page: pagination.page,
            per_page: pagination.per_page,
            total_pages,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metadata_touch() {
        let mut meta = Metadata::new();
        let original_updated = meta.updated_at;
        std::thread::sleep(std::time::Duration::from_millis(10));
        meta.touch();
        assert!(meta.updated_at > original_updated);
        assert_eq!(meta.version, 2);
    }

    #[test]
    fn test_pagination_offset() {
        let pagination = Pagination::new(3, 10);
        assert_eq!(pagination.offset(), 20);
    }

    #[test]
    fn test_paginated_total_pages() {
        let pagination = Pagination::new(1, 10);
        let items: Vec<i32> = vec![];
        let paginated = Paginated::new(items, 25, &pagination);
        assert_eq!(paginated.total_pages, 3);
    }
}
