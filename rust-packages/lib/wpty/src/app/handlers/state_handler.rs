use crate::app::api::StateApi;
use crate::app::pty_app::PtyApp;
use crate::error::{AppError, Result};
use crate::types::SessionState;
use async_trait::async_trait;

#[async_trait]
impl StateApi for PtyApp {
    async fn save_session(&self) -> Result<()> {
        let tabs = self.tab_service.get_tabs_for_saving().await;
        let session_configs = self.session_manager.get_all_configs().await;
        let active_tab_id = self.tab_service.get_active_tab_id_for_saving().await;

        let state = SessionState {
            tabs,
            session_configs,
            active_tab_id,
        };

        self.session_service.save_session(&state).await
    }

    async fn restore_session(&self) -> Result<Option<String>> {
        match self.session_service.load_session().await {
            Ok(Some(state)) => {
                let max_session_id = state.session_configs.keys().max().cloned().unwrap_or(0);
                self.tab_service
                    .restore_session_state(
                        state.tabs.clone(),
                        state.active_tab_id,
                        max_session_id,
                    )
                    .await;

                self.session_manager.restore(state.session_configs.clone(), max_session_id).await;

                let state_json = serde_json::to_string(&state)
                    .map_err(|e| AppError::Serialization(e))?;
                Ok(Some(state_json))
            }
            Ok(None) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
