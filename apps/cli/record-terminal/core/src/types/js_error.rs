use crate::error::AppError;
use wasm_bindgen::JsValue;

impl From<AppError> for JsValue {
    fn from(error: AppError) -> Self {
        JsValue::from_str(&error.to_string())
    }
}
