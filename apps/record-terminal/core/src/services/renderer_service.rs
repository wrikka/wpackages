use crate::error::AppResult;
use gif::{Encoder, Frame, Repeat};
use std::fs::File;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct GifRenderer {
    encoder: Encoder<File>,
    width: u16,
    height: u16,
}

#[wasm_bindgen]
impl GifRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(path: &str, width: u16, height: u16, _delay: u16) -> AppResult<GifRenderer> {
        let image = File::create(path)?;
        let mut encoder = Encoder::new(image, width, height, &[])?;
        encoder.set_repeat(Repeat::Infinite)?;
        Ok(GifRenderer { encoder, width, height })
    }

    pub fn add_frame(&mut self, mut frame_data: Vec<u8>, delay: u16) -> AppResult<()> {
        let mut frame = Frame::from_rgba(self.width, self.height, &mut frame_data);
        frame.delay = delay;
        self.encoder.write_frame(&frame)?;
        Ok(())
    }
}
