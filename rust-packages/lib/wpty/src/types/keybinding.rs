use napi_derive::napi;
use serde::Deserialize;

#[napi]
#[derive(Debug, Deserialize, Clone)]
pub enum Action {
    Copy,
    Paste,
    Search,
    // Add other actions here
}

#[napi(object)]
#[derive(Debug, Deserialize, Clone)]
pub struct Keybinding {
    pub key: String,
    pub mods: Option<String>,
    pub action: Action,
}
