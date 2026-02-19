use crate::browser::BrowserManager;
use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tokio::time::{interval, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamFrame {
    pub timestamp: u64,
    pub frame_data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub format: FrameFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FrameFormat {
    Png,
    Jpeg,
    Webp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamConfig {
    pub fps: u32,
    pub quality: u8,
    pub format: FrameFormat,
    pub max_width: u32,
    pub max_height: u32,
}

impl Default for StreamConfig {
    fn default() -> Self {
        Self {
            fps: 5,
            quality: 80,
            format: FrameFormat::Jpeg,
            max_width: 1280,
            max_height: 720,
        }
    }
}

pub struct LivestreamManager {
    active_streams: Arc<Mutex<Vec<ActiveStream>>>,
}

#[derive(Debug)]
struct ActiveStream {
    session_id: String,
    config: StreamConfig,
    sender: mpsc::Sender<StreamFrame>,
    is_running: bool,
}

impl LivestreamManager {
    pub fn new() -> Self {
        Self {
            active_streams: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn start_stream(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        config: StreamConfig,
    ) -> Result<mpsc::Receiver<StreamFrame>> {
        let (tx, rx) = mpsc::channel(10);
        
        let stream = ActiveStream {
            session_id: session_id.to_string(),
            config: config.clone(),
            sender: tx,
            is_running: true,
        };

        self.active_streams.lock().await.push(stream);

        // Start the stream loop
        let streams = self.active_streams.clone();
        let session_id = session_id.to_string();
        let browser_manager = browser_manager.clone();

        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_millis(1000 / config.fps as u64));
            
            loop {
                ticker.tick().await;
                
                let mut guard = streams.lock().await;
                let stream_opt = guard.iter_mut().find(|s| s.session_id == session_id);
                
                if let Some(stream) = stream_opt {
                    if !stream.is_running {
                        break;
                    }
                    
                    // Capture frame
                    // In a real implementation, this would capture from the browser
                    let frame = StreamFrame {
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs(),
                        frame_data: vec![], // Would contain actual image data
                        width: config.max_width,
                        height: config.max_height,
                        format: config.format.clone(),
                    };
                    
                    if stream.sender.send(frame).await.is_err() {
                        stream.is_running = false;
                        break;
                    }
                } else {
                    break;
                }
            }
        });

        Ok(rx)
    }

    pub async fn stop_stream(&self, session_id: &str) -> Result<()> {
        let mut streams = self.active_streams.lock().await;
        if let Some(stream) = streams.iter_mut().find(|s| s.session_id == session_id) {
            stream.is_running = false;
        }
        streams.retain(|s| s.session_id != session_id);
        Ok(())
    }

    pub async fn get_stream_status(&self, session_id: &str) -> Option<StreamConfig> {
        let streams = self.active_streams.lock().await;
        streams.iter().find(|s| s.session_id == session_id).map(|s| s.config.clone())
    }
}

impl Default for LivestreamManager {
    fn default() -> Self {
        Self::new()
    }
}
