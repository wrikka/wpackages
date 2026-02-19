use crate::services::parser_service::TerminalParser;
use crate::services::renderer_service::GifRenderer;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Recorder {
    parser: TerminalParser,
    renderer: GifRenderer,
}

#[wasm_bindgen]
impl Recorder {
    #[wasm_bindgen(constructor)]
    pub fn new(cols: u16, rows: u16, output_path: &str) -> Result<Recorder, JsValue> {
        let renderer = GifRenderer::new(output_path, cols * 8, rows * 16, 10).map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(Recorder {
            parser: TerminalParser::new(cols, rows),
            renderer,
        })
    }

    pub fn record(&mut self, data: &[u8], delay: u16) -> Result<(), JsValue> {
        self.parser.parse(data);
        let frame_data = self.parser.get_frame_data();
        self.renderer.add_frame(frame_data, delay).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
