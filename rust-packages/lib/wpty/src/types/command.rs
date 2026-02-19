use napi_derive::napi;
use serde::Deserialize;

#[napi(object)]
#[derive(Debug, Deserialize, Clone)]
pub struct Command {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
}
