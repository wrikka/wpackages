use crate::error::{AppError, AppResult};

pub fn copy_text(text: &str) -> AppResult<()> {
    let mut clipboard = arboard::Clipboard::new()
        .map_err(|e: arboard::Error| AppError::InvalidInput(e.to_string()))?;
    clipboard
        .set_text(text.to_string())
        .map_err(|e: arboard::Error| AppError::InvalidInput(e.to_string()))?;
    Ok(())
}
