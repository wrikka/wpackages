use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait IFrameService: Send + Sync {
    async fn list_frames(&self, session_id: &str) -> Result<Vec<String>>;
    async fn switch_to_frame(&self, session_id: &str, frame_id: &str) -> Result<()>;
    async fn switch_to_main(&self, session_id: &str) -> Result<()>;
    async fn find_in_frame(
        &self,
        session_id: &str,
        frame_id: &str,
        selector: &str,
    ) -> Result<Option<String>>;
    async fn click_in_frame(&self, session_id: &str, frame_id: &str, selector: &str) -> Result<()>;
    async fn type_in_frame(
        &self,
        session_id: &str,
        frame_id: &str,
        selector: &str,
        text: &str,
    ) -> Result<()>;
}
