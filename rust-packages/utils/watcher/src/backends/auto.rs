use crate::{config::{Backend as BackendChoice, Config}, error::{Result, WatcherError}, event::Event, traits::Backend};
use super::polling::PollWatcher;
use log::info;
use std::path::Path;
use tokio::sync::mpsc::Sender;

// Import native watchers only when not compiling for WASM
#[cfg(not(target_arch = "wasm32"))]
mod native {
    #[cfg(target_os = "linux")]
    pub use crate::backends::native_linux::NativeLinuxWatcher as NativeWatcher;
    #[cfg(target_os = "macos")]
    pub use crate::backends::native_macos::NativeMacosWatcher as NativeWatcher;
    #[cfg(windows)]
    pub use crate::backends::native_windows::NativeWindowsWatcher as NativeWatcher;
}
#[cfg(not(target_arch = "wasm32"))]
use native::NativeWatcher;

/// A watcher that automatically selects the best available backend.
pub struct AutoWatcher {
    backend: Box<dyn Backend>,
}

#[async_trait::async_trait]
impl Backend for AutoWatcher {
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self> {
        let backend: Box<dyn Backend> = {
            #[cfg(target_arch = "wasm32")]
            {
                info!("Compiling for WASM, selecting polling backend.");
                Box::new(PollWatcher::new(config, tx)?)
            }
            #[cfg(not(target_arch = "wasm32"))]
            {
                match config.backend {
                    BackendChoice::Automatic => {
                        info!("Automatically selecting backend... Native backend available, selecting it.");
                        Box::new(NativeWatcher::new(config, tx)?)
                    }
                    BackendChoice::Native => {
                        info!("User selected native backend.");
                        Box::new(NativeWatcher::new(config, tx)?)
                    }
                    BackendChoice::Polling => {
                        info!("User selected polling backend.");
                        Box::new(PollWatcher::new(config, tx)?)
                    }
                }
            }
        };
        Ok(Self { backend })
    }

    async fn watch(&mut self) -> Result<()> {
        self.backend.watch().await
    }

    fn unwatch(&mut self) -> Result<()> {
        self.backend.unwatch()
    }

    fn add_path(&mut self, path: &Path) -> Result<()> {
        self.backend.add_path(path)
    }

    fn remove_path(&mut self, path: &Path) -> Result<()> {
        self.backend.remove_path(path)
    }
}
