//! # rsui
//!
//! A native Rust GUI toolkit layer for wterminal, built on top of `eframe` and `egui`.
//! This crate provides a simplified entry point and a set of custom widgets for building
//! terminal-style applications.

extern crate self as rsui;

pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod context;
pub mod error;
pub mod prelude;
#[cfg(feature = "full")]
pub mod services;
pub mod theme;
pub mod telemetry;
pub mod types;
#[cfg(feature = "full")]
pub mod utils;
pub mod terminal;

// Performance
pub mod performance;

// Animation
pub mod animation;

// Graphics
pub mod graphics;

// Window Management
pub mod window;

// Advanced Features
pub mod advanced;

// Developer Experience
pub mod dx;

#[cfg(not(target_arch = "wasm32"))]
pub use app::{run, run_with};

#[cfg(target_arch = "wasm32")]
pub use app::run_wasm;

pub use theme::apply as apply_theme;
pub use theme::{panel_frame, surface_frame};

pub use components::{command_palette, text_input};

pub use types::alert::AlertKind;
pub use types::app::RsuiApp;
pub use types::modal::ModalKind;
pub use types::theme::RsuiTheme;
pub use types::toasts::{Toast, ToastKind, Toasts};
pub use types::widgets::ButtonVariant;

// Performance exports
pub use performance::{Cache, VirtualList, VirtualGrid, Profiler};

// Animation exports
pub use animation::{Easing, Transition, KeyframeAnimation, Spring};

// Graphics exports
pub use graphics::{RsuiImage, ImageCache, ShadowConfig, EffectConfig, GpuRenderer};

// Window management exports
pub use window::{WindowManager, WindowConfig};

// Advanced features exports
pub use advanced::{DragDropManager, GestureRecognizer, AccessibilityManager, I18nManager};

// Developer experience exports
pub use dx::{HotReloadManager, ComponentInspector, Storybook, TestHarness};
