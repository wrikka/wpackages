//! Service traits and implementations for the extension system.

pub mod command_service;
pub mod event_bus;
pub mod loader;
pub mod lsp_service;
pub mod marketplace_client;
pub mod marketplace_service;
pub mod permission_service;
pub mod settings_service;
pub mod theme_service;
pub mod tool_registry;
pub mod ui_service;
pub mod webview_service;

pub use self::command_service::CommandRegistry;
pub use self::event_bus::EventBus;
pub use self::lsp_service::LspService;
pub use self::marketplace_client::MarketplaceClient;
pub use self::marketplace_service::MarketplaceService;
pub use self::permission_service::PermissionService;
pub use self::settings_service::SettingsService;
pub use self::theme_service::ThemeService;
pub use self::tool_registry::{RegisteredTool, SharedToolRegistry, ToolRegistry};
pub use self::ui_service::UiRegistry;
pub use self::webview_service::WebViewService;
