//! Application constants
//!
//! This directory contains:
//! - Magic numbers
//! - Default values
//! - Configuration constants
//! - Format-specific constants

pub const DEFAULT_INDENT_SIZE: usize = 2;
pub const MAX_NESTING_DEPTH: usize = 100;
pub const DEFAULT_CACHE_SIZE: usize = 1000;
pub const SECURITY_SCAN_ENABLED: bool = true;

// Format-specific constants
pub mod json {
    pub const MAX_NESTING_DEPTH: usize = 100;
    pub const MAX_STRING_LENGTH: usize = 10 * 1024 * 1024; // 10MB
}

pub mod xml {
    pub const MAX_ELEMENT_DEPTH: usize = 50;
    pub const MAX_ATTRIBUTE_COUNT: usize = 100;
    pub const XXE_PROTECTION_ENABLED: bool = true;
}

pub mod yaml {
    pub const MAX_ALIAS_DEPTH: usize = 10;
    pub const MAX_ANCHOR_DEPTH: usize = 5;
}

pub mod toml {
    pub const MAX_TABLE_DEPTH: usize = 20;
    pub const MAX_ARRAY_LENGTH: usize = 1000;
}
