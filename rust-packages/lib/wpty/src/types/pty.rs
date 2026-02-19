use napi_derive::napi;
use serde::Deserialize;

#[napi(object)]
#[derive(Debug, Clone, Deserialize)]
pub struct PtySize {
    pub rows: u16,
    pub cols: u16,
}
