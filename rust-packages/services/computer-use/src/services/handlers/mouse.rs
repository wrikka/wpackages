use crate::error::{Error, Result};
use crate::protocol::Command;
use crate::selector;
use enigo::{Enigo, Mouse, Button, Coordinate, Direction};
use std::sync::Arc;
use tokio::sync::Mutex;

async fn resolve_selector_to_point(selector: &str) -> Result<(i32, i32)> {
    // This is a simplified version. In a real scenario, this would involve
    // a more complex lookup, possibly involving the snapshot.
    let sel = selector.trim();
    if let Some(index) = selector::get_index_from_screen_selector(sel) {
        let screens = screenshots::Screen::all().map_err(|e| Error::Computer(e.to_string()))?;
        let screen = screens.get(index).ok_or_else(|| Error::InvalidSelector(format!("Invalid screen index: {}", index)))?;
        let di = &screen.display_info;
        let cx = di.x + (di.width as i32 / 2);
        let cy = di.y + (di.height as i32 / 2);
        return Ok((cx, cy));
    }
    Err(Error::InvalidSelector(format!("Unsupported selector: {}", selector)))
}

pub async fn handle_move(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let x = command.params["x"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing x".to_string()))?;
    let y = command.params["y"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing y".to_string()))?;
    let mut eg = enigo.lock().await;
    eg.move_mouse(x as i32, y as i32, Coordinate::Abs)
        .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}

pub async fn handle_click(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let (x, y) = if let (Some(x), Some(y)) = (
        command.params.get("x").and_then(|v| v.as_i64()),
        command.params.get("y").and_then(|v| v.as_i64()),
    ) {
        (x as i32, y as i32)
    } else if let Some(sel) = command.params.get("selector").and_then(|v| v.as_str()) {
        resolve_selector_to_point(sel).await?
    } else {
        return Err(Error::InvalidCommand(
            "Click requires either {x,y} or {selector}".to_string(),
        ));
    };

    let mut eg = enigo.lock().await;
    eg.move_mouse(x, y, Coordinate::Abs)
        .map_err(|e| Error::Computer(e.to_string()))?;
    eg.button(Button::Left, Direction::Click)
        .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}

pub async fn handle_click_element(
    _command: &Command,
    enigo: &Arc<Mutex<Enigo>>,
    element_id: &String,
) -> Result<Option<serde_json::Value>> {
    // TODO: Find element by ID and click on it
    // For now, just click at current position
    let mut eg = enigo.lock().await;
    eg.button(Button::Left, Direction::Click)
        .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(Some(serde_json::json!({ "clicked_element": element_id })))
}

pub async fn handle_swipe(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let x1 = command.params["x1"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing x1".to_string()))?;
    let y1 = command.params["y1"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing y1".to_string()))?;
    let x2 = command.params["x2"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing x2".to_string()))?;
    let y2 = command.params["y2"]
        .as_i64()
        .ok_or_else(|| Error::InvalidCommand("Missing y2".to_string()))?;

    let mut eg = enigo.lock().await;
    eg.move_mouse(x1 as i32, y1 as i32, Coordinate::Abs)
        .map_err(|e| Error::Computer(e.to_string()))?;
    eg.button(Button::Left, Direction::Press)
        .map_err(|e| Error::Computer(e.to_string()))?;
    eg.move_mouse(x2 as i32, y2 as i32, Coordinate::Abs)
        .map_err(|e| Error::Computer(e.to_string()))?;
    eg.button(Button::Left, Direction::Release)
        .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}
