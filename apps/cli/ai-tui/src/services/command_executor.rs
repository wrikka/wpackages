//! Command execution service for TUI application
//!
//! This service handles command palette actions and coordinates
//! between UI components and backend services.

use crate::components::ui::chat_panel::{ChatPanel, MessageRole};
use crate::components::ui::file_explorer::FileExplorer;
use crate::components::ui::output_display::OutputDisplay;
use crate::components::ui::status_bar::StatusBar;
use crate::prelude::*;
use crate::services::ai_service::TuiAiService;
use std::sync::Arc;

/// Command executor for handling command palette actions
pub struct CommandExecutor {
    chat_panel: ChatPanel,
    file_explorer: FileExplorer,
    output_display: OutputDisplay,
    status_bar: StatusBar,
    ai_service: Arc<TuiAiService>,
}

impl CommandExecutor {
    pub fn new(
        chat_panel: ChatPanel,
        file_explorer: FileExplorer,
        output_display: OutputDisplay,
        status_bar: StatusBar,
        ai_service: Arc<TuiAiService>,
    ) -> Self {
        Self {
            chat_panel,
            file_explorer,
            output_display,
            status_bar,
            ai_service,
        }
    }

    /// Execute a command by ID
    pub fn execute(&mut self, command_id: &str) {
        match command_id {
            "open_file" => self.handle_open_file(),
            "save_file" => self.handle_save_file(),
            "new_file" => self.handle_new_file(),
            "search" => self.handle_search(),
            "git_status" => self.handle_git_status(),
            "run_tests" => self.handle_run_tests(),
            "ai_explain_code" => self.handle_ai_explain_code(),
            "ai_generate_code" => self.handle_ai_generate_code(),
            "ai_refactor" => self.handle_ai_refactor(),
            "ai_generate_tests" => self.handle_ai_generate_tests(),
            "ai_find_bugs" => self.handle_ai_find_bugs(),
            "ai_document" => self.handle_ai_document(),
            "ai_optimize" => self.handle_ai_optimize(),
            "ai_clear_cache" => self.handle_ai_clear_cache(),
            _ => {}
        }
    }

    fn handle_open_file(&mut self) {
        if let Some(item) = self.file_explorer.get_selected() {
            if !item.is_directory {
                self.status_bar
                    .set_file_path(Some(item.path.display().to_string()));
                self.output_display
                    .set_content(format!("Opened: {}", item.name));
            }
        }
    }

    fn handle_save_file(&mut self) {
        self.output_display.set_content("File saved!".to_string());
    }

    fn handle_new_file(&mut self) {
        self.output_display
            .set_content("New file created!".to_string());
    }

    fn handle_search(&mut self) {
        self.output_display
            .set_content("Search activated!".to_string());
    }

    fn handle_git_status(&mut self) {
        self.output_display
            .set_content("Git status: No changes".to_string());
    }

    fn handle_run_tests(&mut self) {
        self.output_display
            .set_content("Running tests...".to_string());
    }

    fn handle_ai_explain_code(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Explain Code - Select code and press Enter to get explanation".to_string(),
        );
    }

    fn handle_ai_generate_code(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Generate Code - Describe the code you want to generate".to_string(),
        );
    }

    fn handle_ai_refactor(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Refactor - Describe how you want to refactor the code".to_string(),
        );
    }

    fn handle_ai_generate_tests(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Generate Tests - Select code to generate tests for".to_string(),
        );
    }

    fn handle_ai_find_bugs(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Find Bugs - Select code to analyze for bugs".to_string(),
        );
    }

    fn handle_ai_document(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Generate Documentation - Select code to document".to_string(),
        );
    }

    fn handle_ai_optimize(&mut self) {
        self.chat_panel.add_message(
            MessageRole::System,
            "AI: Optimize - Select code to optimize".to_string(),
        );
    }

    fn handle_ai_clear_cache(&mut self) {
        self.output_display
            .set_content("Clearing AI cache...".to_string());
        let ai_service = self.ai_service.clone();
        let mut output_display = self.output_display.clone();

        tokio::spawn(async move {
            match ai_service.clear_cache().await {
                Ok(()) => {
                    output_display.set_content("AI cache cleared successfully!".to_string());
                }
                Err(e) => {
                    error!("Failed to clear AI cache: {}", e);
                    output_display.set_content(format!("Error clearing cache: {}", e));
                }
            }
        });
    }
}
