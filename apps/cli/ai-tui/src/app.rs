//! TUI Application
//!
//! The TuiApp is the main application entry point that coordinates:
//!
//! - Terminal initialization and cleanup
//! - Event handling and keyboard input
//! - UI component rendering
//! - Command palette integration
//! - AI service interaction
//!
//! # Example
//!
//! ```rust
//! use tui_rust::app::TuiApp;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let mut app = TuiApp::new().await?;
//!     app.run()?;
//!     Ok(())
//! }
//! ```

use crate::components::tui::layout::Layout;
use crate::components::ui::{
    chat_panel::{ChatPanel, MessageRole},
    file_explorer::FileExplorer,
    input_field::InputField,
    output_display::OutputDisplay,
    status_bar::StatusBar,
    CommandPalette,
};
use crate::error::Result;
use crate::prelude::*;
use crate::services::{CommandExecutor, EventHandler, RealEventService, TuiAiService};
use crate::types::{KeyCode, TerminalEvent};
use crossterm::{
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::io::{self, Stdout};
use std::path::PathBuf;

pub struct TuiApp {
    pub terminal: Terminal<CrosstermBackend<Stdout>>,
    pub chat_panel: ChatPanel,
    pub file_explorer: FileExplorer,
    pub input_field: InputField,
    pub output_display: OutputDisplay,
    pub status_bar: StatusBar,
    pub command_palette: CommandPalette,
    pub command_executor: CommandExecutor,
    pub event_handler: EventHandler,
    pub should_quit: bool,
}

impl TuiApp {
    pub async fn new(_config: AppConfig) -> Result<Self> {
        enable_raw_mode()?;
        let mut stdout = io::stdout();
        execute!(stdout, EnterAlternateScreen)?;
        let backend = CrosstermBackend::new(stdout);
        let terminal = Terminal::new(backend)?;

        let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

        // Initialize AI service

        // Initialize UI components
        let chat_panel = ChatPanel::new();
        let file_explorer = FileExplorer::new(current_dir);
        let input_field = InputField::new();
        let output_display = OutputDisplay::new();
        let status_bar = StatusBar::new();
        let command_palette = CommandPalette::new();

        let ai_service = Arc::new(TuiAiService::new());
        let event_service = std::sync::Arc::new(RealEventService::new());
        let event_handler = EventHandler::new(event_service);

        // Initialize command executor
        let command_executor = CommandExecutor::new(
            chat_panel.clone(),
            file_explorer.clone(),
            output_display.clone(),
            status_bar.clone(),
            ai_service,
        );

        Ok(Self {
            terminal,
            chat_panel,
            file_explorer,
            input_field,
            output_display,
            status_bar,
            command_palette,
            command_executor,
            event_handler,
            should_quit: false,
        })
    }

    pub async fn run(&mut self) -> Result<()> {
        self.chat_panel.add_message(
            MessageRole::System,
            "Welcome to TUI Rust AI Assistant! Type your message below.".to_string(),
        );

        while !self.should_quit {
            self.draw()?;
            if self
                .event_handler
                .poll_event(std::time::Duration::from_millis(50))
                .await?
            {
                let event = self.event_handler.read_event().await?;
                self.handle_event(event);
            }
        }

        Ok(())
    }

    fn handle_event(&mut self, event: TerminalEvent) {
        match event {
            TerminalEvent::Key(key) => match key.code {
                KeyCode::Char('q') => {
                    self.should_quit = true;
                }
                _ => {}
            },
            _ => {}
        }
    }

    fn draw(&mut self) -> Result<()> {
        self.terminal.draw(|frame| {
            let size = frame.area();
            let layout = Layout::new(size);

            self.chat_panel.render(frame, layout.chat_area);
            self.file_explorer.render(frame, layout.explorer_area);
            self.input_field.render(frame, layout.input_area);
            self.output_display.render(frame, layout.output_area);
            self.status_bar.render(frame, layout.status_area);

            if self.command_palette.is_visible() {
                let overlay_area = ratatui::layout::Rect {
                    x: size.x + 10,
                    y: size.y + 5,
                    width: size.width - 20,
                    height: size.height - 10,
                };
                self.command_palette.render(frame, overlay_area);
            }
        })?;

        Ok(())
    }

    pub fn submit_chat_message(&mut self, text: String) {
        if text.is_empty() {
            return;
        }

        self.chat_panel.add_message(MessageRole::User, text.clone());
        self.output_display
            .set_content("AI integration not configured. Message received: ".to_string() + &text);
        self.output_display.set_streaming(false);
        self.input_field.clear();

        // TODO: Re-enable when AISDK is properly configured
        // let mut chat_panel_clone = self.chat_panel.clone();
        // let mut output_display_clone = self.output_display.clone();
        //
        // tokio::spawn(async move {
        //     let request = aisdk::core::LanguageModelRequest::builder()
        //         .model(aisdk::providers::OpenAI::gpt_4_turbo())
        //         .prompt(text)
        //         .build();
        //
        //     match request.stream_text().await {
        //         Ok(mut stream_result) => {
        //             let mut full_response = String::new();
        //             while let Some(chunk) = stream_result.stream.next().await {
        //                 match chunk {
        //                     Ok(text_chunk) => {
        //                         full_response.push_str(&text_chunk);
        //                         output_display_clone.set_content(full_response.clone());
        //                     }
        //                     Err(e) => {
        //                         error!("Streaming error: {}", e);
        //                         chat_panel_clone.add_message(
        //                             MessageRole::System,
        //                             format!("Streaming Error: {}", e),
        //                         );
        //                         break;
        //                     }
        //                 }
        //             }
        //             chat_panel_clone.add_message(MessageRole::Assistant, full_response);
        //             output_display_clone.set_streaming(false);
        //         }
        //         Err(e) => {
        //             error!("AI Service error: {}", e);
        //             chat_panel_clone.add_message(MessageRole::System, format!("Error: {}", e));
        //             output_display_clone.set_content("Error occurred.".to_string());
        //             output_display_clone.set_streaming(false);
        //         }
        //     }
        // });
    }

    pub fn cleanup(&mut self) -> Result<()> {
        disable_raw_mode()?;
        execute!(self.terminal.backend_mut(), LeaveAlternateScreen)?;
        Ok(())
    }
}
