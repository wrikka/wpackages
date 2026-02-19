//! Screen capture service

use async_trait::async_trait;
use crate::error::Result;
use crate::types::{ScreenInfo, Snapshot, UIElement};

/// Screen service trait
#[async_trait]
pub trait ScreenService: Send + Sync {
    /// Take a snapshot
    async fn snapshot(&self) -> Result<Snapshot>;

    /// Get screen information
    async fn screens(&self) -> Result<Vec<ScreenInfo>>;

    /// Take a screenshot
    async fn screenshot(&self, screen: Option<u32>) -> Result<Vec<u8>>;

    /// Get primary screen
    async fn primary_screen(&self) -> Result<ScreenInfo>;
}

/// Screenshots-based screen service
pub struct ScreenshotsService;

impl ScreenshotsService {
    /// Create new screenshots service
    pub const fn new() -> Self {
        Self
    }
}

impl Default for ScreenshotsService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ScreenService for ScreenshotsService {
    async fn snapshot(&self) -> Result<Snapshot> {
        let screens = screenshots::Screen::all()
            .map_err(|e| crate::error::Error::Screenshot(e.to_string()))?;

        let screen_infos: Vec<ScreenInfo> = screens
            .iter()
            .enumerate()
            .map(|(i, s)| ScreenInfo {
                index: i as u32,
                x: s.display_info.x,
                y: s.display_info.y,
                width: s.display_info.width,
                height: s.display_info.height,
                is_primary: i == 0,
            })
            .collect();

        Ok(Snapshot {
            screens: screen_infos,
            nodes: Vec::new(),
            timestamp: std::time::Instant::now(),
        })
    }

    async fn screens(&self) -> Result<Vec<ScreenInfo>> {
        let screens = screenshots::Screen::all()
            .map_err(|e| crate::error::Error::Screenshot(e.to_string()))?;

        Ok(screens
            .iter()
            .enumerate()
            .map(|(i, s)| ScreenInfo {
                index: i as u32,
                x: s.display_info.x,
                y: s.display_info.y,
                width: s.display_info.width,
                height: s.display_info.height,
                is_primary: i == 0,
            })
            .collect())
    }

    async fn screenshot(&self, screen: Option<u32>) -> Result<Vec<u8>> {
        let screens = screenshots::Screen::all()
            .map_err(|e| crate::error::Error::Screenshot(e.to_string()))?;

        let screen_index = screen.unwrap_or(0) as usize;
        let screen = screens
            .get(screen_index)
            .ok_or_else(|| crate::error::Error::Screenshot(format!("Screen {} not found", screen_index)))?;

        let image = screen
            .capture()
            .map_err(|e| crate::error::Error::Screenshot(e.to_string()))?;

        let mut buffer = Vec::new();
        image
            .write_to(&mut std::io::Cursor::new(&mut buffer), image::ImageFormat::Png)
            .map_err(|e| crate::error::Error::Screenshot(e.to_string()))?;

        Ok(buffer)
    }

    async fn primary_screen(&self) -> Result<ScreenInfo> {
        let screens = self.screens().await?;
        screens
            .into_iter()
            .find(|s| s.is_primary)
            .ok_or_else(|| crate::error::Error::Screenshot("No primary screen found".to_string()))
    }
}
