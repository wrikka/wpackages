//! HTTP client adapter module

pub mod client;
pub mod retry;
pub mod response;

pub use client::*;
pub use retry::*;
pub use response::*;
