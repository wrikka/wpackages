use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait BasicAuthService: Send + Sync {
    async fn handle_auth_dialog(
        &self,
        session_id: &str,
        username: &str,
        password: &str,
    ) -> Result<()>;
    async fn cancel_auth_dialog(&self, session_id: &str) -> Result<()>;
    async fn is_auth_dialog_present(&self, session_id: &str) -> Result<bool>;
}
