pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const NAME: &str = env!("CARGO_PKG_NAME");

pub const DEFAULT_MARKETPLACE_URL: &str = "https://marketplace.wterminal.io";
pub const DEFAULT_EXTENSION_DIR: &str = ".wterminal/extensions";

pub const SUPPORTED_TARGETS: &[&str] = &[
    "x86_64-pc-windows-msvc",
    "x86_64-unknown-linux-gnu",
    "x86_64-apple-darwin",
    "aarch64-apple-darwin",
];

pub const EXTENSION_MANIFEST_FILE: &str = "wterminal-ext.toml";
pub const EXTENSION_SOURCE_DIR: &str = "src";
pub const EXTENSION_BUILD_DIR: &str = "target";
pub const EXTENSION_DIST_DIR: &str = "dist";
