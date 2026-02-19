use napi_derive::napi;

#[napi(object)]
#[derive(Debug, Clone)]
pub struct TabInfo {
    pub id: u32,
    pub title: String,
    pub is_active: bool,
}
