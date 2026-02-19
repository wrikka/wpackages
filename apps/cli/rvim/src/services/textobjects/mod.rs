pub mod finders;
pub mod pair_matcher;
pub mod types;

pub use types::{TextObject, TextObjectRange};

use crate::error::Result;
use crate::services::tree_sitter::TreeSitterService;

pub struct TextObjectsService {
    tree_sitter: TreeSitterService,
}

impl TextObjectsService {
    pub fn new(tree_sitter: TreeSitterService) -> Self {
        Self { tree_sitter }
    }

    pub fn find_text_object(
        &mut self,
        source: &str,
        line: usize,
        col: usize,
        text_object: TextObject,
        language: &str,
    ) -> Result<Option<TextObjectRange>> {
        let tree = self.tree_sitter.parse(source, language)?;
        let root = tree.root_node();

        finders::find_text_object(source, &root, line, col, text_object)
    }

    pub fn find_matching_pair(
        &self,
        source: &str,
        line: usize,
        col: usize,
    ) -> Result<Option<(usize, usize, usize, usize)>> {
        pair_matcher::find_matching_pair(source, line, col)
    }
}

impl Default for TextObjectsService {
    fn default() -> Self {
        Self::new(TreeSitterService::new().unwrap())
    }
}
