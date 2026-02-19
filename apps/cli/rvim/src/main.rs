//! RVim - Modern Terminal-based Text Editor
//!
//! This is the main entry point for the RVim application.

use clap::Parser;
use crossterm::event::{self, Event, KeyCode};
use crossterm::terminal::{self, EnterAlternateScreen, LeaveAlternateScreen};
use crossterm::ExecutableCommand;
use ratatui::prelude::{CrosstermBackend, Terminal};
use rvim::app::App;
use rvim::components::ui::UiRenderer;
use rvim::config::AppConfig;
use rvim::telemetry;
use std::io::{self, stdout};
use std::time::Duration;

/// RVim - A modern terminal-based text editor
#[derive(Parser, Debug)]
#[command(name = "rvim")]
#[command(about = "A modern terminal-based text editor", long_about = None)]
struct Args {
    /// File to open
    #[arg(name = "FILE")]
    file: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize telemetry/logging
    telemetry::init_subscriber();

    // Parse command line arguments
    let args = Args::parse();

    // Load configuration
    let config = AppConfig::load()?;

    // Log file opening if specified
    if let Some(ref file) = args.file {
        tracing::info!("Opening file: {}", file);
    }

    // Setup terminal UI
    stdout().execute(EnterAlternateScreen)?;
    terminal::enable_raw_mode()?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;
    terminal.clear()?;

    // Initialize application
    let mut app = App::new(config)?;
    let ui_renderer = UiRenderer::new();

    // Main application loop
    while !app.should_quit {
        // Render UI
        terminal.draw(|frame| {
            let area = frame.size();
            ui_renderer.render(frame, area, &app);
        })?;

        // Handle input events
        if event::poll(Duration::from_millis(16))? {
            if let Event::Key(key) = event::read()? {
                // Handle Ctrl+C for quit
                if key.code == KeyCode::Char('c') && key.modifiers == event::KeyModifiers::CONTROL {
                    app.should_quit = true;
                }
                // Pass other key events to the app
                app.on_key(key);
            }
        }
    }

    // Restore terminal state
    stdout().execute(LeaveAlternateScreen)?;
    terminal::disable_raw_mode()?;

    Ok(())
}
