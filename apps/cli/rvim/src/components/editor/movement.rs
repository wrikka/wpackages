use super::state::EditorState;

impl EditorState {
    pub fn move_up(&mut self) {
        if self.cursor_y > 0 {
            self.cursor_y -= 1;
            self.clamp_cursor_x();
        }
    }

    pub fn move_down(&mut self) {
        if self.cursor_y + 1 < self.content.len() {
            self.cursor_y += 1;
            self.clamp_cursor_x();
        }
    }

    pub fn move_left(&mut self) {
        if self.cursor_x > 0 {
            self.cursor_x -= 1;
        }
    }

    pub fn move_right(&mut self) {
        if self.cursor_x < self.current_line_len() {
            self.cursor_x += 1;
        }
    }

    pub fn move_word_left(&mut self) {
        while self.cursor_x > 0 {
            self.cursor_x -= 1;
            if self
                .current_line()
                .chars()
                .nth(self.cursor_x)
                .is_some_and(|c| c.is_whitespace())
            {
                break;
            }
        }
    }

    pub fn move_word_right(&mut self) {
        let line_len = self.current_line_len();
        while self.cursor_x < line_len {
            self.cursor_x += 1;
            if self
                .current_line()
                .chars()
                .nth(self.cursor_x)
                .is_some_and(|c| c.is_whitespace())
            {
                break;
            }
        }
    }

    pub fn move_line_start(&mut self) {
        self.cursor_x = 0;
    }

    pub fn move_line_end(&mut self) {
        self.cursor_x = self.current_line_len();
    }

    pub fn move_file_start(&mut self) {
        self.cursor_y = 0;
        self.cursor_x = 0;
    }

    pub fn move_file_end(&mut self) {
        self.cursor_y = self.content.len().saturating_sub(1);
        self.cursor_x = self.current_line_len();
    }
}
