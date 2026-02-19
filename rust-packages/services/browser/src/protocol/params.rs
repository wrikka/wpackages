use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OpenParams {
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClickParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TypeParams {
    pub selector: String,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FillParams {
    pub selector: String,
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetTextParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetHtmlParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetValueParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetAttrParams {
    pub selector: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetCountParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExtractTableParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IsVisibleParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IsEnabledParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IsCheckedParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScreenshotParams {
    pub path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HoverParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScrollParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CheckParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UncheckParams {
    pub selector: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UploadParams {
    pub selector: String,
    pub path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SwitchTabParams {
    pub index: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CloseTabParams {
    pub index: usize,
}
