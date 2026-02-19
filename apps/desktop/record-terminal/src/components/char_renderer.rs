use crate::constants::font::FONT_DATA;

const FONT_WIDTH: u16 = 8;
const FONT_HEIGHT: u16 = 16;

pub fn render_char(
    frame_buffer: &mut [u8],
    buffer_width: usize,
    char_to_render: char,
    fg_color: (u8, u8, u8),
    bg_color: (u8, u8, u8),
    char_x: usize, // character column
    char_y: usize, // character row
) {
    let char_code = char_to_render as usize;
    let font_char = FONT_DATA[char_code];

    for y in 0..FONT_HEIGHT as usize {
        let row_pixels = font_char[y];
        for x in 0..FONT_WIDTH as usize {
            let pixel_is_set = (row_pixels >> (7 - x)) & 1 == 1;

            let color = if pixel_is_set { fg_color } else { bg_color };

            let px = char_x * FONT_WIDTH as usize + x;
            let py = char_y * FONT_HEIGHT as usize + y;
            let idx = (py * buffer_width + px) * 4;

            if idx + 3 < frame_buffer.len() {
                frame_buffer[idx] = color.0;     // R
                frame_buffer[idx + 1] = color.1; // G
                frame_buffer[idx + 2] = color.2; // B
                frame_buffer[idx + 3] = 255;       // Alpha
            }
        }
    }
}
