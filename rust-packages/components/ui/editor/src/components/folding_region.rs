use crate::error::{CodeFoldingError, CodeFoldingResult};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

/// Kind of folding region
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FoldingRegionKind {
    /// Comment
    Comment,
    /// Imports
    Imports,
    /// Region (custom folding region)
    Region,
    /// Function
    Function,
    /// Class
    Class,
    /// Struct
    Struct,
    /// Enum
    Enum,
    /// Interface
    Interface,
    /// Block (braces)
    Block,
    /// Array/Vector
    Array,
    /// Object/Map
    Object,
    /// Custom
    Custom,
}

impl FoldingRegionKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            FoldingRegionKind::Comment => "comment",
            FoldingRegionKind::Imports => "imports",
            FoldingRegionKind::Region => "region",
            FoldingRegionKind::Function => "function",
            FoldingRegionKind::Class => "class",
            FoldingRegionKind::Struct => "struct",
            FoldingRegionKind::Enum => "enum",
            FoldingRegionKind::Interface => "interface",
            FoldingRegionKind::Block => "block",
            FoldingRegionKind::Array => "array",
            FoldingRegionKind::Object => "object",
            FoldingRegionKind::Custom => "custom",
        }
    }

    pub fn from_str(s: &str) -> CodeFoldingResult<Self> {
        match s.to_lowercase().as_str() {
            "comment" => Ok(FoldingRegionKind::Comment),
            "imports" => Ok(FoldingRegionKind::Imports),
            "region" => Ok(FoldingRegionKind::Region),
            "function" => Ok(FoldingRegionKind::Function),
            "class" => Ok(FoldingRegionKind::Class),
            "struct" => Ok(FoldingRegionKind::Struct),
            "enum" => Ok(FoldingRegionKind::Enum),
            "interface" => Ok(FoldingRegionKind::Interface),
            "block" => Ok(FoldingRegionKind::Block),
            "array" => Ok(FoldingRegionKind::Array),
            "object" => Ok(FoldingRegionKind::Object),
            "custom" => Ok(FoldingRegionKind::Custom),
            _ => Err(CodeFoldingError::InvalidRegion(format!("Unknown region kind: {}", s))),
        }
    }
}

/// Folding region in the text
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FoldingRegion {
    pub start_line: usize,
    pub start_column: usize,
    pub end_line: usize,
    pub end_column: usize,
    pub kind: FoldingRegionKind,
    pub collapsed: bool,
    pub label: Option<String>,
}

impl FoldingRegion {
    pub fn new(
        start_line: usize,
        start_column: usize,
        end_line: usize,
        end_column: usize,
        kind: FoldingRegionKind,
    ) -> Self {
        Self {
            start_line,
            start_column,
            end_line,
            end_column,
            kind,
            collapsed: false,
            label: None,
        }
    }

    pub fn with_label(mut self, label: impl Into<String>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn with_collapsed(mut self, collapsed: bool) -> Self {
        self.collapsed = collapsed;
        self
    }

    pub fn line_count(&self) -> usize {
        if self.end_line >= self.start_line {
            self.end_line - self.start_line + 1
        } else {
            0
        }
    }

    pub fn contains_line(&self, line: usize) -> bool {
        line >= self.start_line && line <= self.end_line
    }

    pub fn contains_position(&self, line: usize, column: usize) -> bool {
        if line < self.start_line || line > self.end_line {
            return false;
        }

        if line == self.start_line && column < self.start_column {
            return false;
        }

        if line == self.end_line && column > self.end_column {
            return false;
        }

        true
    }

    pub fn is_single_line(&self) -> bool {
        self.start_line == self.end_line
    }

    pub fn is_multi_line(&self) -> bool {
        !self.is_single_line()
    }

    pub fn is_collapsed(&self) -> bool {
        self.collapsed
    }

    pub fn toggle(&mut self) {
        self.collapsed = !self.collapsed;
    }

    pub fn collapse(&mut self) {
        self.collapsed = true;
    }

    pub fn expand(&mut self) {
        self.collapsed = false;
    }

    pub fn cmp(&self, other: &Self) -> Ordering {
        match self.start_line.cmp(&other.start_line) {
            Ordering::Equal => self.start_column.cmp(&other.start_column),
            other => other,
        }
    }

    pub fn overlaps(&self, other: &Self) -> bool {
        // Check if regions overlap
        if self.end_line < other.start_line || other.end_line < self.start_line {
            return false;
        }

        // Check if one region is completely inside the other
        if self.start_line <= other.start_line && self.end_line >= other.end_line {
            return true;
        }

        if other.start_line <= self.start_line && other.end_line >= self.end_line {
            return true;
        }

        false
    }

    pub fn contains(&self, other: &Self) -> bool {
        self.start_line <= other.start_line
            && self.end_line >= other.end_line
            && (self.start_line < other.start_line
                || (self.start_line == other.start_line && self.start_column <= other.start_column))
            && (self.end_line > other.end_line
                || (self.end_line == other.end_line && self.end_column >= other.end_column))
    }

    pub fn merge(&self, other: &Self) -> CodeFoldingResult<FoldingRegion> {
        if !self.overlaps(other) {
            return Err(CodeFoldingError::InvalidRegion(
                "Cannot merge non-overlapping regions".to_string(),
            ));
        }

        let start_line = self.start_line.min(other.start_line);
        let start_column = if start_line == self.start_line {
            self.start_column.min(other.start_column)
        } else if start_line == other.start_line {
            other.start_column
        } else {
            0
        };

        let end_line = self.end_line.max(other.end_line);
        let end_column = if end_line == self.end_line {
            self.end_column.max(other.end_column)
        } else if end_line == other.end_line {
            other.end_column
        } else {
            0
        };

        // Use the kind of the outer region
        let kind = if self.contains(other) {
            self.kind
        } else if other.contains(self) {
            other.kind
        } else {
            FoldingRegionKind::Block
        };

        Ok(FoldingRegion::new(start_line, start_column, end_line, end_column, kind))
    }
}

impl PartialOrd for FoldingRegion {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_folding_region_creation() {
        let region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        assert_eq!(region.start_line, 0);
        assert_eq!(region.end_line, 5);
        assert_eq!(region.line_count(), 6);
    }

    #[test]
    fn test_folding_region_contains() {
        let region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        assert!(region.contains_line(3));
        assert!(!region.contains_line(6));
    }

    #[test]
    fn test_folding_region_toggle() {
        let mut region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        assert!(!region.is_collapsed());
        region.toggle();
        assert!(region.is_collapsed());
        region.toggle();
        assert!(!region.is_collapsed());
    }

    #[test]
    fn test_folding_region_overlaps() {
        let region1 = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        let region2 = FoldingRegion::new(3, 0, 8, 10, FoldingRegionKind::Block);
        assert!(region1.overlaps(&region2));

        let region3 = FoldingRegion::new(6, 0, 10, 10, FoldingRegionKind::Block);
        assert!(!region1.overlaps(&region3));
    }

    #[test]
    fn test_folding_region_merge() {
        let region1 = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        let region2 = FoldingRegion::new(3, 0, 8, 10, FoldingRegionKind::Block);

        let merged = region1.merge(&region2).unwrap();
        assert_eq!(merged.start_line, 0);
        assert_eq!(merged.end_line, 8);
    }
}
