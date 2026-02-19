pub mod actions;
pub mod types;

pub use types::{SelectionRange, SurroundPair};

use crate::error::Result;
use crate::services::textobjects::TextObjectsService;

pub struct SurroundService {
    #[allow(dead_code)]
    textobjects: TextObjectsService,
}

impl SurroundService {
    pub fn new(textobjects: TextObjectsService) -> Self {
        Self { textobjects }
    }

    pub fn add_surround(
        &self,
        source: &str,
        line: usize,
        start_col: usize,
        end_col: usize,
        pair: SurroundPair,
    ) -> Result<String> {
        actions::add_surround(source, line, start_col, end_col, pair)
    }

    pub fn change_surround(
        &self,
        source: &str,
        line: usize,
        col: usize,
        old_pair: SurroundPair,
        new_pair: SurroundPair,
    ) -> Result<String> {
        actions::change_surround(source, line, col, old_pair, new_pair)
    }

    pub fn delete_surround(
        &self,
        source: &str,
        line: usize,
        col: usize,
        pair: SurroundPair,
    ) -> Result<String> {
        actions::delete_surround(source, line, col, pair)
    }

    pub fn find_surround_pair_at_position(
        &self,
        source: &str,
        line: usize,
        col: usize,
    ) -> Result<Option<SurroundPair>> {
        actions::find_surround_pair_at_position(source, line, col)
    }

    pub fn surround_selection(
        &self,
        source: &str,
        start_line: usize,
        start_col: usize,
        end_line: usize,
        end_col: usize,
        pair: SurroundPair,
    ) -> Result<String> {
        actions::surround_selection(source, start_line, start_col, end_line, end_col, pair)
    }

    pub fn replace_surround_in_selection(
        &self,
        source: &str,
        selection: SelectionRange,
        old_pair: SurroundPair,
        new_pair: SurroundPair,
    ) -> Result<String> {
        actions::replace_surround_in_selection(source, selection, old_pair, new_pair)
    }

    pub fn delete_surround_in_selection(
        &self,
        source: &str,
        start_line: usize,
        start_col: usize,
        end_line: usize,
        end_col: usize,
        pair: SurroundPair,
    ) -> Result<String> {
        actions::delete_surround_in_selection(
            source, start_line, start_col, end_line, end_col, pair,
        )
    }
}

impl Default for SurroundService {
    fn default() -> Self {
        Self::new(TextObjectsService::default())
    }
}
