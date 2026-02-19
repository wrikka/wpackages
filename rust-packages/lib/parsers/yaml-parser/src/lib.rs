use wasm_bindgen::prelude::*;
use serde_yaml::Value;

#[wasm_bindgen]
pub fn parse(source: &str) -> Result<JsValue, JsValue> {
    let result: Result<Value, _> = serde_yaml::from_str(source);
    match result {
        Ok(value) => Ok(serde_wasm_bindgen::to_value(&value).unwrap()),
        Err(e) => Err(JsValue::from_str(&e.to_string())),
    }
}
