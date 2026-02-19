use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json::Value;

#[napi]
pub fn parse(source: String) -> Result<Value, Error> {
    let result: Result<Value, quick_xml::DeError> = quick_xml::de::from_str(&source);
    match result {
        Ok(value) => Ok(value),
        Err(e) => Err(Error::new(
            Status::InvalidArg,
            format!("XML parse error: {}", e),
        )),
    }
}
