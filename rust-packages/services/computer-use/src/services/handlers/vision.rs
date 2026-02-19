use crate::error::{Error, Result};
use crate::protocol::Command;
use crate::types::Rect;
use crate::vision;
use base64::Engine;
use std::io::Cursor;

pub fn handle_ocr(command: &Command) -> Result<Option<serde_json::Value>> {
    let x = command.params.get("x").and_then(|v| v.as_i64()).map(|v| v as i32);
    let y = command.params.get("y").and_then(|v| v.as_i64()).map(|v| v as i32);
    let width = command.params.get("width").and_then(|v| v.as_u64()).map(|v| v as u32);
    let height = command.params.get("height").and_then(|v| v.as_u64()).map(|v| v as u32);

    let roi = match (x, y, width, height) {
        (Some(x), Some(y), Some(width), Some(height)) => Some(Rect { x, y, width, height }),
        _ => None,
    };

    let text = vision::read_text_from_screen(roi)?;
    Ok(Some(serde_json::json!({ "text": text })))
}

pub fn handle_visual_search(command: &Command) -> Result<Option<serde_json::Value>> {
    let image_path = command.params["image_path"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing image_path".to_string()))?;
    let rect = vision::find_image_on_screen(image_path)?;
    Ok(Some(serde_json::to_value(rect).map_err(|e| Error::Protocol(e.to_string()))?))
}

pub fn handle_screenshot(command: &Command) -> Result<Option<serde_json::Value>> {
    let screens = screenshots::Screen::all().map_err(|e| Error::Computer(e.to_string()))?;
    if screens.is_empty() {
        return Err(Error::Computer("No screens detected".to_string()));
    }

    let idx = command
        .params
        .get("screen")
        .and_then(|v| v.as_u64())
        .unwrap_or(0) as usize;

    let screen = screens
        .get(idx)
        .ok_or_else(|| Error::InvalidCommand(format!("Invalid screen index: {}", idx)))?;

    let rgba = screen.capture().map_err(|e| Error::Computer(e.to_string()))?;

    let mut png_bytes = Vec::new();
    let dynimg = image::DynamicImage::ImageRgba8(rgba);
    dynimg
        .write_to(&mut Cursor::new(&mut png_bytes), image::ImageFormat::Png)
        .map_err(|e| Error::Computer(e.to_string()))?;

    if let Some(path) = command.params.get("path").and_then(|v| v.as_str()) {
        std::fs::write(path, &png_bytes).map_err(|e| Error::Io(e))?;
        Ok(Some(serde_json::json!({ "path": path, "mime": "image/png" })))
    } else {
        let b64 = base64::engine::general_purpose::STANDARD.encode(png_bytes);
        Ok(Some(serde_json::json!({ "base64": b64, "mime": "image/png" })))
    }
}
