use napi::bindgen_prelude::*;
use napi_derive::napi;
use toml::Value;

#[napi]
pub fn parse(source: String) -> Result<Value, Error> {
    let result: Result<Value, toml::de::Error> = toml::from_str(&source);
    match result {
        Ok(value) => Ok(value),
        Err(e) => Err(Error::new(
            Status::InvalidArg,
            format!("TOML parse error: {}", e),
        )),
    }
}
