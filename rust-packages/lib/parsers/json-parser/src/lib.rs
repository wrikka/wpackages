use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json::Value;

#[napi]
pub fn parse(source: String) -> Result<Value, Error> {
    let result: Result<Value, serde_json::Error> = serde_json::from_str(&source);
    match result {
        Ok(value) => Ok(value),
        Err(e) => Err(Error::new(
            Status::InvalidArg,
            format!("JSON parse error: {}", e),
        )),
    }
}
