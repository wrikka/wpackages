use crate::error::Result;
use crate::services::surround::SurroundPair;
use crate::services::textobjects::TextObject;

use super::state::EditorState;

impl EditorState {
    pub fn textobject_at_cursor(
        &mut self,
        text_object: TextObject,
    ) -> Option<(usize, usize, usize, usize)> {
        let source = self.content.join("\n");

        if let Ok(Some(range)) = self.context.textobjects.find_text_object(
            &source,
            self.cursor_y,
            self.cursor_x,
            text_object,
            &self.language,
        ) {
            Some((
                range.start_line,
                range.start_col,
                range.end_line,
                range.end_col,
            ))
        } else {
            None
        }
    }

    pub fn find_matching_pair(&self) -> Option<(usize, usize, usize, usize)> {
        let source = self.content.join("\n");

        if let Ok(Some(pair)) =
            self.context
                .textobjects
                .find_matching_pair(&source, self.cursor_y, self.cursor_x)
        {
            Some(pair)
        } else {
            None
        }
    }

    pub fn add_surround(&mut self, pair: SurroundPair) -> Result<String> {
        let source = self.content.join("\n");

        if let Some(selection) = self.primary_selection() {
            self.context.surround.surround_selection(
                &source,
                selection.start_line,
                selection.start_col,
                selection.end_line,
                selection.end_col,
                pair,
            )
        } else {
            self.context.surround.add_surround(
                &source,
                self.cursor_y,
                self.cursor_x,
                self.cursor_x,
                pair,
            )
        }
    }

    pub fn change_surround(
        &mut self,
        old_pair: SurroundPair,
        new_pair: SurroundPair,
    ) -> Result<String> {
        let source = self.content.join("\n");

        if let Some(selection) = self.primary_selection() {
            let selection_range = crate::services::surround::SelectionRange::new(
                selection.start_line,
                selection.start_col,
                selection.end_line,
                selection.end_col,
            );
            self.context.surround.replace_surround_in_selection(
                &source,
                selection_range,
                old_pair,
                new_pair,
            )
        } else {
            self.context.surround.change_surround(
                &source,
                self.cursor_y,
                self.cursor_x,
                old_pair,
                new_pair,
            )
        }
    }

    pub fn delete_surround(&mut self, pair: SurroundPair) -> Result<String> {
        let source = self.content.join("\n");

        if let Some(selection) = self.primary_selection() {
            self.context.surround.delete_surround_in_selection(
                &source,
                selection.start_line,
                selection.start_col,
                selection.end_line,
                selection.end_col,
                pair,
            )
        } else {
            self.context
                .surround
                .delete_surround(&source, self.cursor_y, self.cursor_x, pair)
        }
    }
}
