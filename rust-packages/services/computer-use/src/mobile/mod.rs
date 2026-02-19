//! Mobile Companion Module
//!
//! Mobile app integration for remote control and monitoring
//!
//! Features:
//! - Mobile Companion (Feature 14)
//! - Device pairing
//! - Push notifications
//! - Remote commands

pub mod companion;
pub mod api;

pub use companion::*;
pub use api::*;
