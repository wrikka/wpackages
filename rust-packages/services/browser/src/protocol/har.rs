use serde::{Deserialize, Serialize};

// Simplified HAR structures

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct Har {
    pub log: HarLog,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarLog {
    pub version: String,
    pub creator: HarCreator,
    pub entries: Vec<HarEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarCreator {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarEntry {
    #[serde(rename = "startedDateTime")]
    pub started_date_time: String,
    pub request: HarRequest,
    pub response: HarResponse,
    pub timings: HarTimings,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HarHeader>,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarResponse {
    pub status: i64,
    #[serde(rename = "statusText")]
    pub status_text: String,
    pub headers: Vec<HarHeader>,
}

#[derive(Debug, Serialize, Deserialize, Clone)] pub struct HarHeader {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)] pub struct HarTimings {
    pub send: f64,
    pub wait: f64,
    pub receive: f64,
}
