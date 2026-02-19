use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait StateApi {
    async fn save_session(&self) -> Result<()>;

    async fn restore_session(&self) -> Result<Option<String>>;
}
