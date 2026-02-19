use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum BrowserType {
    #[default]
    Chromium,
    Firefox,
    WebKit,
}

impl BrowserType {
    pub fn is_chromium(&self) -> bool {
        matches!(self, BrowserType::Chromium)
    }

    pub fn is_firefox(&self) -> bool {
        matches!(self, BrowserType::Firefox)
    }

    pub fn is_webkit(&self) -> bool {
        matches!(self, BrowserType::WebKit)
    }
}

impl std::fmt::Display for BrowserType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BrowserType::Chromium => write!(f, "chromium"),
            BrowserType::Firefox => write!(f, "firefox"),
            BrowserType::WebKit => write!(f, "webkit"),
        }
    }
}
