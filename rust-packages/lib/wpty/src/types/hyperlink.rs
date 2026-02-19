use napi_derive::napi;

#[napi(object)]
#[derive(Debug, Clone)]
pub struct Hyperlink {
    pub uri: String,
}
