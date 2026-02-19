use crate::error::{CodeFoldingError, CodeFoldingResult};
use crate::components::folding_region::{FoldingRegion, FoldingRegionKind};
use syntect::parsing::{ParseState, ScopeStack, SyntaxDefinition, SyntaxSet};
use syntect::highlighting::{Theme, ThemeSet};

/// Code folding manager
#[derive(Debug, Clone)]
pub struct FoldingManager {
    syntax_set: SyntaxSet,
    regions: Vec<FoldingRegion>,
    max_fold_level: usize,
}

impl FoldingManager {
    /// Create a new folding manager
    pub fn new() -> Self {
        Self {
            syntax_set: SyntaxSet::load_defaults_newlines(),
            regions: Vec::new(),
            max_fold_level: 10,
        }
    }

    /// Create a folding manager with custom syntax set
    pub fn with_syntax_set(syntax_set: SyntaxSet) -> Self {
        Self {
            syntax_set,
            regions: Vec::new(),
            max_fold_level: 10,
        }
    }

    /// Set maximum fold level
    pub fn set_max_fold_level(&mut self, level: usize) {
        self.max_fold_level = level;
    }

    /// Get maximum fold level
    pub fn max_fold_level(&self) -> usize {
        self.max_fold_level
    }

    /// Get all folding regions
    pub fn regions(&self) -> &[FoldingRegion] {
        &self.regions
    }

    /// Get folding regions for a specific line
    pub fn regions_for_line(&self, line: usize) -> Vec<&FoldingRegion> {
        self.regions
            .iter()
            .filter(|r| r.contains_line(line))
            .collect()
    }

    /// Get folding region at position
    pub fn region_at(&self, line: usize, column: usize) -> Option<&FoldingRegion> {
        self.regions
            .iter()
            .find(|r| r.contains_position(line, column))
            .cloned()
    }

    /// Add a folding region
    pub fn add_region(&mut self, region: FoldingRegion) {
        self.regions.push(region);
    }

    /// Remove a folding region
    pub fn remove_region(&mut self, index: usize) -> CodeFoldingResult<FoldingRegion> {
        if index >= self.regions.len() {
            return Err(CodeFoldingError::InvalidRegion(format!(
                "Region index {} not found",
                index
            )));
        }

        Ok(self.regions.remove(index))
    }

    /// Clear all folding regions
    pub fn clear(&mut self) {
        self.regions.clear();
    }

    /// Sort regions by position
    pub fn sort(&mut self) {
        self.regions.sort_by(|a, b| a.cmp(b));
    }

    /// Merge overlapping regions
    pub fn merge_overlapping(&mut self) {
        if self.regions.is_empty() {
            return;
        }

        self.sort();

        let mut merged = Vec::new();
        let mut current = self.regions[0].clone();

        for region in &self.regions[1..] {
            if current.overlaps(region) {
                match current.merge(region) {
                    Ok(merged_region) => current = merged_region,
                    Err(_) => {
                        merged.push(current);
                        current = region.clone();
                    }
                }
            } else {
                merged.push(current);
                current = region.clone();
            }
        }

        merged.push(current);
        self.regions = merged;
    }

    /// Remove nested regions (keep only outer regions)
    pub fn remove_nested(&mut self) {
        let mut filtered = Vec::new();

        for region in &self.regions {
            let is_nested = filtered.iter().any(|outer| outer.contains(region));
            if !is_nested {
                filtered.push(region.clone());
            }
        }

        self.regions = filtered;
    }

    /// Fold all regions
    pub fn fold_all(&mut self) {
        for region in &mut self.regions {
            region.collapse();
        }
    }

    /// Expand all regions
    pub fn expand_all(&mut self) {
        for region in &mut self.regions {
            region.expand();
        }
    }

    /// Fold region at index
    pub fn fold(&mut self, index: usize) -> CodeFoldingResult<()> {
        if index >= self.regions.len() {
            return Err(CodeFoldingError::InvalidRegion(format!(
                "Region index {} not found",
                index
            )));
        }

        self.regions[index].collapse();
        Ok(())
    }

    /// Expand region at index
    pub fn expand(&mut self, index: usize) -> CodeFoldingResult<()> {
        if index >= self.regions.len() {
            return Err(CodeFoldingError::InvalidRegion(format!(
                "Region index {} not found",
                index
            )));
        }

        self.regions[index].expand();
        Ok(())
    }

    /// Toggle region at index
    pub fn toggle(&mut self, index: usize) -> CodeFoldingResult<()> {
        if index >= self.regions.len() {
            return Err(CodeFoldingError::InvalidRegion(format!(
                "Region index {} not found",
                index
            )));
        }

        self.regions[index].toggle();
        Ok(())
    }

    /// Get collapsed regions
    pub fn collapsed_regions(&self) -> Vec<&FoldingRegion> {
        self.regions.iter().filter(|r| r.is_collapsed()).collect()
    }

    /// Get expanded regions
    pub fn expanded_regions(&self) -> Vec<&FoldingRegion> {
        self.regions.iter().filter(|r| !r.is_collapsed()).collect()
    }

    /// Get lines that are hidden due to collapsed regions
    pub fn hidden_lines(&self) -> Vec<usize> {
        let mut hidden = Vec::new();

        for region in &self.regions {
            if region.is_collapsed() && region.is_multi_line() {
                // Hide all lines except the first
                for line in (region.start_line + 1)..=region.end_line {
                    hidden.push(line);
                }
            }
        }

        hidden.sort();
        hidden.dedup();
        hidden
    }

    /// Check if a line is hidden
    pub fn is_line_hidden(&self, line: usize) -> bool {
        self.hidden_lines().contains(&line)
    }

    /// Calculate visible line count
    pub fn visible_line_count(&self, total_lines: usize) -> usize {
        let hidden_count = self.hidden_lines().len();
        total_lines.saturating_sub(hidden_count)
    }

    /// Update folding regions for text
    pub fn update(&mut self, text: &str, language_id: &str) -> CodeFoldingResult<()> {
        self.regions.clear();

        // Detect regions based on syntax
        self.detect_syntax_regions(text, language_id)?;

        // Detect custom regions (e.g., #region, #endregion)
        self.detect_custom_regions(text)?;

        // Detect comment regions
        self.detect_comment_regions(text)?;

        // Sort and merge
        self.sort();
        self.merge_overlapping();
        self.remove_nested();

        Ok(())
    }

    /// Detect folding regions based on syntax
    fn detect_syntax_regions(&mut self, text: &str, language_id: &str) -> CodeFoldingResult<()> {
        // Get syntax definition for language
        let syntax = self
            .syntax_set
            .find_syntax_by_token(language_id)
            .or_else(|| self.syntax_set.find_syntax_by_extension(language_id))
            .ok_or_else(|| CodeFoldingError::SyntaxError(format!("Unknown language: {}", language_id)))?;

        let mut parse_state = ParseState::new(syntax);
        let lines: Vec<&str> = text.lines().collect();

        for (line_idx, line) in lines.iter().enumerate() {
            let ops = parse_state.parse_line(line, &self.syntax_set);
            
            // Check for folding markers in scopes
            for op in ops {
                if let Some(scope) = self.syntax_set.scopes().get(op.scope) {
                    let scope_str = scope.as_str();
                    
                    // Detect block start/end
                    if scope_str.contains("meta.block") {
                        // This is a block - could be a folding region
                        // We'll need to track brace matching
                    }
                }
            }
        }

        Ok(())
    }

    /// Detect custom folding regions (e.g., #region, #endregion)
    fn detect_custom_regions(&mut self, text: &str) -> CodeFoldingResult<()> {
        let lines: Vec<&str> = text.lines().collect();
        let mut region_stack: Vec<(usize, usize)> = Vec::new(); // (line, column)

        for (line_idx, line) in lines.iter().enumerate() {
            let trimmed = line.trim();

            // Check for region start markers
            if trimmed.starts_with("#region") || trimmed.starts_with("// region") {
                let column = line.find('#').or_else(|| line.find('/')).unwrap_or(0);
                region_stack.push((line_idx, column));
            }

            // Check for region end markers
            if trimmed.starts_with("#endregion") || trimmed.starts_with("// endregion") {
                if let Some((start_line, start_column)) = region_stack.pop() {
                    let end_column = line.find('#').or_else(|| line.find('/')).unwrap_or(0);
                    let region = FoldingRegion::new(
                        start_line,
                        start_column,
                        line_idx,
                        end_column,
                        FoldingRegionKind::Region,
                    )
                    .with_label("Region".to_string());

                    self.regions.push(region);
                }
            }
        }

        Ok(())
    }

    /// Detect comment folding regions
    fn detect_comment_regions(&mut self, text: &str) -> CodeFoldingResult<()> {
        let lines: Vec<&str> = text.lines().collect();
        let mut comment_start: Option<(usize, usize)> = None;

        for (line_idx, line) in lines.iter().enumerate() {
            let trimmed = line.trim();

            // Detect single-line comment start
            if trimmed.starts_with("//") || trimmed.starts_with("#") {
                if comment_start.is_none() {
                    comment_start = Some((line_idx, 0));
                }
            } else if let Some((start_line, _)) = comment_start {
                // Comment ended
                if start_line < line_idx {
                    let region = FoldingRegion::new(
                        start_line,
                        0,
                        line_idx - 1,
                        lines[line_idx - 1].len(),
                        FoldingRegionKind::Comment,
                    );

                    // Only add if it's multi-line
                    if region.is_multi_line() {
                        self.regions.push(region);
                    }
                }
                comment_start = None;
            }
        }

        // Handle comment that goes to end of file
        if let Some((start_line, _)) = comment_start {
            if start_line < lines.len() - 1 {
                let region = FoldingRegion::new(
                    start_line,
                    0,
                    lines.len() - 1,
                    lines[lines.len() - 1].len(),
                    FoldingRegionKind::Comment,
                );

                if region.is_multi_line() {
                    self.regions.push(region);
                }
            }
        }

        Ok(())
    }

    /// Detect brace-based folding regions
    pub fn detect_brace_regions(&mut self, text: &str) -> CodeFoldingResult<()> {
        let lines: Vec<&str> = text.lines().collect();
        let mut brace_stack: Vec<(usize, usize, char)> = Vec::new(); // (line, column, brace_char)

        for (line_idx, line) in lines.iter().enumerate() {
            for (col_idx, ch) in line.chars().enumerate() {
                match ch {
                    '{' | '[' | '(' => {
                        brace_stack.push((line_idx, col_idx, ch));
                    }
                    '}' | ']' | ')' => {
                        if let Some((start_line, start_col, start_ch)) = brace_stack.pop() {
                            // Check if braces match
                            if Self::braces_match(start_ch, ch) {
                                let kind = match start_ch {
                                    '{' => FoldingRegionKind::Block,
                                    '[' => FoldingRegionKind::Array,
                                    '(' => FoldingRegionKind::Object,
                                    _ => FoldingRegionKind::Block,
                                };

                                let region = FoldingRegion::new(
                                    start_line,
                                    start_col,
                                    line_idx,
                                    col_idx,
                                    kind,
                                );

                                // Only add if it's multi-line
                                if region.is_multi_line() {
                                    self.regions.push(region);
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        Ok(())
    }

    fn braces_match(open: char, close: char) -> bool {
        matches!(
            (open, close),
            ('{', '}') | ('[', ']') | ('(', ')')
        )
    }
}

impl Default for FoldingManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Code folding trait
pub trait CodeFolding {
    /// Fold all regions
    fn fold_all(&mut self);

    /// Expand all regions
    fn expand_all(&mut self);

    /// Toggle folding at position
    fn toggle_at(&mut self, line: usize, column: usize) -> CodeFoldingResult<()>;

    /// Get folding regions
    fn regions(&self) -> &[FoldingRegion];

    /// Update folding regions
    fn update(&mut self, text: &str, language_id: &str) -> CodeFoldingResult<()>;
}

impl CodeFolding for FoldingManager {
    fn fold_all(&mut self) {
        self.fold_all();
    }

    fn expand_all(&mut self) {
        self.expand_all();
    }

    fn toggle_at(&mut self, line: usize, column: usize) -> CodeFoldingResult<()> {
        if let Some(region) = self.region_at(line, column) {
            // Find index of region
            let index = self
                .regions
                .iter()
                .position(|r| r.start_line == region.start_line && r.start_column == region.start_column)
                .ok_or_else(|| CodeFoldingError::InvalidRegion("Region not found".to_string()))?;

            self.toggle(index)
        } else {
            Err(CodeFoldingError::InvalidRegion("No region at position".to_string()))
        }
    }

    fn regions(&self) -> &[FoldingRegion] {
        self.regions()
    }

    fn update(&mut self, text: &str, language_id: &str) -> CodeFoldingResult<()> {
        self.update(text, language_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_folding_manager_creation() {
        let manager = FoldingManager::new();
        assert_eq!(manager.region_count(), 0);
    }

    #[test]
    fn test_add_region() {
        let mut manager = FoldingManager::new();
        let region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        manager.add_region(region);
        assert_eq!(manager.region_count(), 1);
    }

    #[test]
    fn test_fold_expand() {
        let mut manager = FoldingManager::new();
        let region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block);
        manager.add_region(region);

        manager.fold(0).unwrap();
        assert!(manager.collapsed_regions().len() == 1);

        manager.expand(0).unwrap();
        assert!(manager.expanded_regions().len() == 1);
    }

    #[test]
    fn test_detect_custom_regions() {
        let mut manager = FoldingManager::new();
        let text = "// region start\nsome code\n// region end";
        manager.detect_custom_regions(text).unwrap();
        assert_eq!(manager.region_count(), 1);
    }

    #[test]
    fn test_detect_brace_regions() {
        let mut manager = FoldingManager::new();
        let text = "function test() {\n  let x = 1;\n  return x;\n}";
        manager.detect_brace_regions(text).unwrap();
        assert!(manager.region_count() > 0);
    }

    #[test]
    fn test_merge_overlapping() {
        let mut manager = FoldingManager::new();
        manager.add_region(FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block));
        manager.add_region(FoldingRegion::new(3, 0, 8, 10, FoldingRegionKind::Block));

        manager.merge_overlapping();
        assert_eq!(manager.region_count(), 1);
    }

    #[test]
    fn test_hidden_lines() {
        let mut manager = FoldingManager::new();
        let region = FoldingRegion::new(0, 0, 5, 10, FoldingRegionKind::Block)
            .with_collapsed(true);
        manager.add_region(region);

        let hidden = manager.hidden_lines();
        assert_eq!(hidden.len(), 5); // Lines 1-5 are hidden
        assert!(hidden.contains(&1));
        assert!(!hidden.contains(&0));
    }
}
