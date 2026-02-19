use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_yaml::Value;

#[napi]
pub fn parse(source: String) -> Result<Value, Error> {
    let result: Result<Value, serde_yaml::Error> = serde_yaml::from_str(&source);
    match result {
        Ok(value) => Ok(value),
        Err(e) => Err(Error::new(
            Status::InvalidArg,
            format!("YAML parse error: {}", e),
        )),
    }
}
