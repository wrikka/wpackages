use super::state::EditorState;
use crate::error::Result;

impl EditorState {
    pub async fn get_completions(&self) -> Result<Vec<lsp_types::CompletionItem>> {
        let lsp = self.context.lsp.lock().await;

        if let Some(file_path) = &self.file_path {
            lsp.get_completions(file_path.clone(), self.cursor_y, self.cursor_x)
                .await
        } else {
            Ok(Vec::new())
        }
    }

    pub async fn get_diagnostics(&self) -> Result<Vec<lsp_types::Diagnostic>> {
        let lsp = self.context.lsp.lock().await;
        let source = self.content.join("\n");

        if let Some(file_path) = &self.file_path {
            lsp.get_diagnostics(file_path.clone(), &source).await
        } else {
            Ok(Vec::new())
        }
    }

    pub async fn get_hover(&self) -> Result<lsp_types::HoverContents> {
        let lsp = self.context.lsp.lock().await;

        if let Some(file_path) = &self.file_path {
            lsp.get_hover(file_path.clone(), self.cursor_y, self.cursor_x)
                .await
        } else {
            Ok(lsp_types::HoverContents::Scalar(
                lsp_types::MarkedString::String("No information available".to_string()),
            ))
        }
    }

    pub async fn go_to_definition(&self) -> Result<Option<lsp_types::Location>> {
        let lsp = self.context.lsp.lock().await;

        if let Some(file_path) = &self.file_path {
            lsp.go_to_definition(file_path.clone(), self.cursor_y, self.cursor_x)
                .await
        } else {
            Ok(None)
        }
    }
}
