use super::state::EditorState;
use crate::error::Result;

impl EditorState {
    pub fn insert_char(&mut self, c: char) -> Result<()> {
        if self.cursor_y >= self.content.len() {
            self.content.push(String::new());
        }

        let line = &mut self.content[self.cursor_y];
        line.insert(self.cursor_x, c);
        self.cursor_x += 1;

        self.update_syntax_highlighting();

        Ok(())
    }

    pub fn insert_newline(&mut self) -> Result<()> {
        if self.cursor_y >= self.content.len() {
            self.content.push(String::new());
        }

        let line = &mut self.content[self.cursor_y];
        let remaining = line.split_off(self.cursor_x);
        self.content.insert(self.cursor_y + 1, remaining);

        self.cursor_y += 1;
        self.cursor_x = 0;

        self.update_syntax_highlighting();

        Ok(())
    }

    pub fn delete_char(&mut self) -> Result<()> {
        if self.cursor_y >= self.content.len() {
            return Ok(());
        }

        if self.cursor_x > 0 {
            let line = &mut self.content[self.cursor_y];
            line.remove(self.cursor_x - 1);
            self.cursor_x -= 1;
        } else if self.cursor_y > 0 {
            let prev_line_len = self.content[self.cursor_y - 1].len();
            let line_to_move = self.content[self.cursor_y].clone();
            self.content[self.cursor_y - 1].push_str(&line_to_move);
            self.content.remove(self.cursor_y);
            self.cursor_y -= 1;
            self.cursor_x = prev_line_len;
        }

        self.update_syntax_highlighting();

        Ok(())
    }
}
