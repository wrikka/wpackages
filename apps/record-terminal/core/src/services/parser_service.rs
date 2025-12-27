use wasm_bindgen::prelude::*;

// Represents a single cell on the terminal screen
#[derive(Clone, Copy)]
pub struct TerminalCell {
    char: char,
    fg: (u8, u8, u8),
    bg: (u8, u8, u8),
}

#[wasm_bindgen]
pub struct TerminalParser {
    cols: u16,
    rows: u16,
    cursor_x: u16,
    cursor_y: u16,
    screen_buffer: Vec<TerminalCell>,
    current_fg: (u8, u8, u8),
    current_bg: (u8, u8, u8),
}

#[wasm_bindgen]
impl TerminalParser {
    #[wasm_bindgen(constructor)]
    pub fn new(cols: u16, rows: u16) -> TerminalParser {
        let default_cell = TerminalCell { char: ' ', fg: (255, 255, 255), bg: (0, 0, 0) };
        TerminalParser {
            cols,
            rows,
            cursor_x: 0,
            cursor_y: 0,
            screen_buffer: vec![default_cell; (cols * rows) as usize],
            current_fg: (255, 255, 255),
            current_bg: (0, 0, 0),
        }
    }

    pub fn parse(&mut self, data: &[u8]) {
        // Custom ANSI escape code parsing logic will go here
        // For now, we'll just print printable characters
        for &byte in data {
            if byte >= 32 && byte <= 126 { // Printable ASCII
                let index = (self.cursor_y * self.cols + self.cursor_x) as usize;
                if index < self.screen_buffer.len() {
                    self.screen_buffer[index] = TerminalCell {
                        char: byte as char,
                        fg: self.current_fg,
                        bg: self.current_bg,
                    };
                }
                self.cursor_x += 1;
                if self.cursor_x >= self.cols {
                    self.cursor_x = 0;
                    self.cursor_y += 1;
                    if self.cursor_y >= self.rows {
                        self.cursor_y = 0; // or scroll
                    }
                }
            }
        }
    }

    pub fn get_frame_data(&self) -> Vec<u8> {
        // This part remains the same, but now uses our own screen_buffer
        let mut frame_data = vec![0; (self.cols as usize * 8 * self.rows as usize * 16 * 4) as usize];
        for row in 0..self.rows {
            for col in 0..self.cols {
                let cell = self.screen_buffer[(row * self.cols + col) as usize];
                crate::components::char_renderer::render_char(
                    &mut frame_data,
                    self.cols as usize * 8,
                    cell.char,
                    cell.fg,
                    cell.bg,
                    col as usize,
                    row as usize,
                );
            }
        }
        frame_data
    }
}
