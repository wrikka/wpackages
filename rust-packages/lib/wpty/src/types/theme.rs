use napi_derive::napi;
use serde::Deserialize;

#[napi(object)]
#[derive(Debug, Deserialize, Clone)]
pub struct Colors {
    pub primary: String,
    pub background: String,
    pub foreground: String,
}

#[napi(object)]
#[derive(Debug, Deserialize, Clone)]
pub struct Theme {
    pub name: String,
    pub colors: Colors,
}
