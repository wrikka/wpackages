use napi_derive::napi;

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PtyConfig {
    pub command: String,
    pub args: Vec<String>,
    pub cwd: Option<String>,
    pub initial_command: Option<String>,
    pub rows: u16,
    pub cols: u16,
}
