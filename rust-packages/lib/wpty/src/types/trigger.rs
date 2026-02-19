use napi_derive::napi;
use serde::Deserialize;

#[napi]
#[derive(Debug, Deserialize, Clone)]
pub enum TriggerAction {
    Notify,
}

#[napi(object)]
#[derive(Debug, Deserialize, Clone)]
pub struct TriggerSpec {
    pub pattern: String,
    pub action: TriggerAction,
    pub message: Option<String>,
}
