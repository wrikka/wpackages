use wasm_bindgen::prelude::*;
use toml::Value;

#[wasm_bindgen]
pub fn parse(source: &str) -> Result<JsValue, JsValue> {
    let result: Result<Value, _> = toml::from_str(source);
    match result {
        Ok(value) => Ok(serde_wasm_bindgen::to_value(&value).unwrap()),
        Err(e) => Err(JsValue::from_str(&e.to_string())),
    }
}
