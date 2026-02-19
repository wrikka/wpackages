//! Core prompt types and builders

use crate::completion::{CompletionSource, FuzzyMatcher};
use crate::error::{Error, Result};
use crate::history::{History, InputHistory};
use crate::keybind::{KeyAction, Keymap};
use crate::render::{RenderEngine, TerminalRenderer};
use crate::theme::{SymbolSet, Theme};
use crate::validation::{ValidationChain, ValidationError, Validator};
use async_trait::async_trait;
use crossterm::event::{self, Event as CrosstermEvent, KeyCode, KeyEvent, KeyModifiers};
use std::io::Write;
use std::time::Duration;
use tokio::time::timeout;

/// Base trait for all prompts
#[async_trait]
pub trait Prompt<T>: Send {
    async fn interact(&mut self) -> Result<T>;
}

/// Text input prompt
pub struct Text {
    message: String,
    placeholder: Option<String>,
    default: Option<String>,
    secret: bool,
    validators: ValidationChain<String>,
    theme: Theme,
    history: Option<InputHistory>,
    completion: Option<Box<dyn CompletionSource>>,
}

impl Text {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            placeholder: None,
            default: None,
            secret: false,
            validators: ValidationChain::new(),
            theme: Theme::default(),
            history: None,
            completion: None,
        }
    }

    pub fn placeholder(mut self, placeholder: impl Into<String>) -> Self {
        self.placeholder = Some(placeholder.into());
        self
    }

    pub fn default(mut self, default: impl Into<String>) -> Self {
        self.default = Some(default.into());
        self
    }

    pub fn secret(mut self) -> Self {
        self.secret = true;
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub fn validate<V>(mut self, validator: V) -> Self
    where
        V: Validator<String> + 'static,
    {
        self.validators = self.validators.add(validator);
        self
    }

    pub fn with_history(mut self, capacity: usize) -> Self {
        self.history = Some(InputHistory::new(capacity));
        self
    }

    pub fn with_completion(mut self, source: impl CompletionSource + 'static) -> Self {
        self.completion = Some(Box::new(source));
        self
    }

    pub async fn interact(&self) -> Result<String> {
        let mut value = self.default.clone().unwrap_or_default();
        let mut cursor = value.len();
        let mut show_completions = false;
        let mut completion_idx = 0;
        let mut completions: Vec<String> = Vec::new();

        // Enable raw mode
        crossterm::terminal::enable_raw_mode()?;
        
        let engine = RenderEngine::new(self.theme.clone());
        let keymap = Keymap::standard();

        loop {
            // Render
            engine.clear_line()?;
            engine.print_prefix(true)?;
            
            // Print message
            print!("{}: ", self.message);
            
            // Print value (or placeholder)
            if value.is_empty() {
                if let Some(ref placeholder) = self.placeholder {
                    print!("{}", placeholder.stylize().with(self.theme.colors.muted));
                }
            } else {
                if self.secret {
                    print!("{}", "*".repeat(value.len()));
                } else {
                    print!("{}", value);
                }
            }

            // Show completions
            if show_completions && !completions.is_empty() {
                print!("\n");
                for (i, comp) in completions.iter().enumerate().take(5) {
                    if i == completion_idx {
                        print!("  {} {}\n", 
                            self.theme.symbols.pointer.stylize().with(self.theme.colors.primary),
                            comp.stylize().with(self.theme.colors.primary)
                        );
                    } else {
                        print!("  {} {}\n",
                            " ".repeat(self.theme.symbols.pointer.chars().count()),
                            comp.stylize().with(self.theme.colors.muted)
                        );
                    }
                }
            }

            // Move cursor
            let offset = self.message.len() + 3 + cursor;
            crossterm::execute!(
                std::io::stdout(),
                crossterm::cursor::MoveToColumn(offset as u16)
            )?;

            std::io::stdout().flush()?;

            // Wait for input
            match wait_for_key(Duration::from_millis(100)).await {
                Some(Ok(event)) => {
                    match event {
                        CrosstermEvent::Key(key) => {
                            let action = keymap.get_action(key.code, key.modifiers);
                            
                            match action {
                                KeyAction::Submit => {
                                    if !value.is_empty() {
                                        if let Err(e) = self.validators.validate(&value) {
                                            show_error(&e.to_string());
                                            continue;
                                        }
                                        crossterm::terminal::disable_raw_mode()?;
                                        println!();
                                        return Ok(value);
                                    } else if let Some(ref default) = self.default {
                                        crossterm::terminal::disable_raw_mode()?;
                                        println!();
                                        return Ok(default.clone());
                                    }
                                }
                                KeyAction::Cancel => {
                                    crossterm::terminal::disable_raw_mode()?;
                                    return Err(Error::Cancelled);
                                }
                                KeyAction::Complete => {
                                    if let Some(ref completion) = self.completion {
                                        if !show_completions {
                                            completions = completion.complete(&value);
                                            show_completions = !completions.is_empty();
                                        } else {
                                            if !completions.is_empty() {
                                                value = completions[completion_idx].clone();
                                                cursor = value.len();
                                                show_completions = false;
                                            }
                                        }
                                    }
                                }
                                _ => match key.code {
                                    KeyCode::Char(c) => {
                                        value.insert(cursor, c);
                                        cursor += 1;
                                        show_completions = false;
                                    }
                                    KeyCode::Backspace => {
                                        if cursor > 0 {
                                            cursor -= 1;
                                            value.remove(cursor);
                                        }
                                    }
                                    KeyCode::Delete => {
                                        if cursor < value.len() {
                                            value.remove(cursor);
                                        }
                                    }
                                    KeyCode::Left => {
                                        if cursor > 0 {
                                            cursor -= 1;
                                        }
                                    }
                                    KeyCode::Right => {
                                        if cursor < value.len() {
                                            cursor += 1;
                                        }
                                    }
                                    KeyCode::Home => {
                                        cursor = 0;
                                    }
                                    KeyCode::End => {
                                        cursor = value.len();
                                    }
                                    KeyCode::Up => {
                                        if show_completions && completion_idx > 0 {
                                            completion_idx -= 1;
                                        } else if let Some(ref mut h) = self.history {
                                            if let Some(prev) = h.prev() {
                                                value = prev.clone();
                                                cursor = value.len();
                                            }
                                        }
                                    }
                                    KeyCode::Down => {
                                        if show_completions && completion_idx + 1 < completions.len().min(5) {
                                            completion_idx += 1;
                                        } else if let Some(ref mut h) = self.history {
                                            if let Some(next) = h.next() {
                                                value = next.clone();
                                                cursor = value.len();
                                            }
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                        _ => {}
                    }
                }
                Some(Err(_)) => break,
                None => {}
            }
        }

        crossterm::terminal::disable_raw_mode()?;
        Ok(value)
    }
}

/// Password input (secret text)
pub type Password = Text;

/// Confirm (yes/no) prompt
pub struct Confirm {
    message: String,
    default: Option<bool>,
    theme: Theme,
}

impl Confirm {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            default: None,
            theme: Theme::default(),
        }
    }

    pub fn default(mut self, default: bool) -> Self {
        self.default = Some(default);
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<bool> {
        let hint = match self.default {
            Some(true) => " (Y/n)",
            Some(false) => " (y/N)",
            None => " (y/n)",
        };

        crossterm::terminal::enable_raw_mode()?;
        
        let engine = RenderEngine::new(self.theme.clone());
        engine.clear_line()?;
        engine.print_prefix(true)?;
        print!("{}{}: ", self.message, hint);
        std::io::stdout().flush()?;

        let keymap = Keymap::standard();

        loop {
            match wait_for_key(Duration::from_millis(100)).await {
                Some(Ok(CrosstermEvent::Key(key))) => {
                    match key.code {
                        KeyCode::Char('y') | KeyCode::Char('Y') => {
                            crossterm::terminal::disable_raw_mode()?;
                            println!("yes");
                            return Ok(true);
                        }
                        KeyCode::Char('n') | KeyCode::Char('N') => {
                            crossterm::terminal::disable_raw_mode()?;
                            println!("no");
                            return Ok(false);
                        }
                        KeyCode::Enter => {
                            if let Some(default) = self.default {
                                crossterm::terminal::disable_raw_mode()?;
                                println!();
                                return Ok(default);
                            }
                        }
                        KeyCode::Esc => {
                            crossterm::terminal::disable_raw_mode()?;
                            return Err(Error::Cancelled);
                        }
                        _ => {}
                    }
                }
                Some(Err(e)) => {
                    crossterm::terminal::disable_raw_mode()?;
                    return Err(e.into());
                }
                None => {}
            }
        }
    }
}

/// Select prompt (single choice)
pub struct Select {
    message: String,
    options: Vec<String>,
    default: Option<usize>,
    theme: Theme,
}

impl Select {
    pub fn new(message: impl Into<String>, options: impl IntoIterator<Item = impl Into<String>>) -> Self {
        Self {
            message: message.into(),
            options: options.into_iter().map(|s| s.into()).collect(),
            default: Some(0),
            theme: Theme::default(),
        }
    }

    pub fn default(mut self, index: usize) -> Self {
        self.default = Some(index.min(self.options.len().saturating_sub(1)));
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<String> {
        let mut selected = self.default.unwrap_or(0);
        let mut offset = 0;

        crossterm::terminal::enable_raw_mode()?;
        crossterm::execute!(std::io::stdout(), crossterm::cursor::Hide)?;

        let renderer = TerminalRenderer::new(self.theme.clone())?;
        let keymap = Keymap::standard();

        loop {
            renderer.render_select(&self.message, &self.options, selected, offset)?;

            match wait_for_key(Duration::from_millis(100)).await {
                Some(Ok(CrosstermEvent::Key(key))) => {
                    let action = keymap.get_action(key.code, key.modifiers);

                    match action {
                        KeyAction::Submit => {
                            crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                            crossterm::terminal::disable_raw_mode()?;
                            return Ok(self.options[selected].clone());
                        }
                        KeyAction::Cancel => {
                            crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                            crossterm::terminal::disable_raw_mode()?;
                            return Err(Error::Cancelled);
                        }
                        KeyAction::SelectNext => {
                            if selected + 1 < self.options.len() {
                                selected += 1;
                            }
                        }
                        KeyAction::SelectPrev => {
                            if selected > 0 {
                                selected -= 1;
                            }
                        }
                        KeyAction::SelectFirst => {
                            selected = 0;
                        }
                        KeyAction::SelectLast => {
                            selected = self.options.len().saturating_sub(1);
                        }
                        _ => {}
                    }
                }
                Some(Err(e)) => {
                    crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                    crossterm::terminal::disable_raw_mode()?;
                    return Err(e.into());
                }
                None => {}
            }
        }
    }
}

/// Multi-select prompt
pub struct MultiSelect {
    message: String,
    options: Vec<String>,
    theme: Theme,
}

impl MultiSelect {
    pub fn new(message: impl Into<String>, options: impl IntoIterator<Item = impl Into<String>>) -> Self {
        Self {
            message: message.into(),
            options: options.into_iter().map(|s| s.into()).collect(),
            theme: Theme::default(),
        }
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<Vec<String>> {
        let mut selected: Vec<bool> = vec![false; self.options.len()];
        let mut cursor = 0;

        crossterm::terminal::enable_raw_mode()?;
        crossterm::execute!(std::io::stdout(), crossterm::cursor::Hide)?;

        let renderer = TerminalRenderer::new(self.theme.clone())?;
        let keymap = Keymap::standard();

        loop {
            renderer.render_multi_select(&self.message, &self.options, &selected, cursor)?;

            match wait_for_key(Duration::from_millis(100)).await {
                Some(Ok(CrosstermEvent::Key(key))) => {
                    let action = keymap.get_action(key.code, key.modifiers);

                    match action {
                        KeyAction::Submit => {
                            crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                            crossterm::terminal::disable_raw_mode()?;
                            let result: Vec<String> = self.options
                                .iter()
                                .enumerate()
                                .filter(|(i, _)| selected[*i])
                                .map(|(_, opt)| opt.clone())
                                .collect();
                            return Ok(result);
                        }
                        KeyAction::Cancel => {
                            crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                            crossterm::terminal::disable_raw_mode()?;
                            return Err(Error::Cancelled);
                        }
                        KeyAction::SelectNext => {
                            if cursor + 1 < self.options.len() {
                                cursor += 1;
                            }
                        }
                        KeyAction::SelectPrev => {
                            if cursor > 0 {
                                cursor -= 1;
                            }
                        }
                        KeyAction::Toggle => {
                            if let Some(sel) = selected.get_mut(cursor) {
                                *sel = !*sel;
                            }
                        }
                        _ => {}
                    }
                }
                Some(Err(e)) => {
                    crossterm::execute!(std::io::stdout(), crossterm::cursor::Show)?;
                    crossterm::terminal::disable_raw_mode()?;
                    return Err(e.into());
                }
                None => {}
            }
        }
    }
}

/// Number input prompt
pub struct Number<T: std::str::FromStr> {
    message: String,
    default: Option<T>,
    theme: Theme,
}

impl<T: std::str::FromStr + Send + Sync> Number<T> {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            default: None,
            theme: Theme::default(),
        }
    }

    pub fn default(mut self, default: T) -> Self {
        self.default = Some(default);
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<T> {
        let text = Text::new(&self.message)
            .with_theme(self.theme.clone())
            .interact()
            .await?;

        if text.is_empty() {
            if let Some(default) = &self.default {
                return Ok(*default);
            }
        }

        text.parse::<T>()
            .map_err(|_| Error::InvalidInput(format!("Cannot parse '{}' as number", text)))
    }
}

/// Editor prompt (opens system editor)
pub struct Editor {
    message: String,
    default: Option<String>,
    theme: Theme,
}

impl Editor {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            default: None,
            theme: Theme::default(),
        }
    }

    pub fn default(mut self, default: impl Into<String>) -> Self {
        self.default = Some(default.into());
        self
    }

    pub async fn interact(&self) -> Result<String> {
        use std::process::Command;

        let editor = std::env::var("EDITOR")
            .or_else(|_| std::env::var("VISUAL"))
            .unwrap_or_else(|| "vi".to_string());

        // Create temp file
        let temp_file = std::env::temp_dir().join(format!("prompt_{}.txt", std::process::id()));
        
        // Write default content
        if let Some(ref default) = self.default {
            std::fs::write(&temp_file, default)?;
        }

        // Open editor
        let status = Command::new(&editor)
            .arg(&temp_file)
            .status()
            .map_err(|e| Error::Io(e))?;

        if !status.success() {
            return Err(Error::Custom("Editor returned non-zero exit code".to_string()));
        }

        // Read result
        let content = std::fs::read_to_string(&temp_file)?;
        
        // Cleanup
        let _ = std::fs::remove_file(&temp_file);

        Ok(content)
    }
}

/// Path input prompt
pub struct PathPrompt {
    message: String,
    must_exist: bool,
    is_dir: bool,
    theme: Theme,
}

impl PathPrompt {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            must_exist: false,
            is_dir: false,
            theme: Theme::default(),
        }
    }

    pub fn must_exist(mut self) -> Self {
        self.must_exist = true;
        self
    }

    pub fn is_dir(mut self) -> Self {
        self.is_dir = true;
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<std::path::PathBuf> {
        let text = Text::new(&self.message)
            .with_theme(self.theme.clone())
            .interact()
            .await?;

        let path = std::path::PathBuf::from(&text);

        if self.must_exist && !path.exists() {
            return Err(Error::Validation(format!("Path '{}' does not exist", text)));
        }

        if self.is_dir && path.exists() && !path.is_dir() {
            return Err(Error::Validation(format!("'{}' is not a directory", text)));
        }

        Ok(path)
    }
}

/// Auto-complete prompt with fuzzy matching
pub struct AutoComplete {
    message: String,
    source: Box<dyn CompletionSource>,
    theme: Theme,
}

impl AutoComplete {
    pub fn new(message: impl Into<String>, source: impl CompletionSource + 'static) -> Self {
        Self {
            message: message.into(),
            source: Box::new(source),
            theme: Theme::default(),
        }
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub async fn interact(&self) -> Result<String> {
        let text = Text::new(&self.message)
            .with_theme(self.theme.clone())
            .with_completion(self.source.as_ref())
            .interact()
            .await?;
        Ok(text)
    }
}

// Helper functions
async fn wait_for_key(timeout: Duration) -> Option<std::io::Result<CrosstermEvent>> {
    match tokio::time::timeout(timeout, tokio::task::spawn_blocking(|| event::read())).await {
        Ok(Ok(result)) => Some(result),
        _ => None,
    }
}

fn show_error(msg: &str) {
    eprintln!("\n✖ Error: {}", msg);
}

// Convenience functions
pub fn text(message: impl Into<String>) -> Text {
    Text::new(message)
}

pub fn password(message: impl Into<String>) -> Text {
    Text::new(message).secret()
}

pub fn confirm(message: impl Into<String>) -> Confirm {
    Confirm::new(message)
}

pub fn select(message: impl Into<String>, options: impl IntoIterator<Item = impl Into<String>>) -> Select {
    Select::new(message, options)
}

pub fn multi_select(message: impl Into<String>, options: impl IntoIterator<Item = impl Into<String>>) -> MultiSelect {
    MultiSelect::new(message, options)
}

pub fn number<T: std::str::FromStr>(message: impl Into<String>) -> Number<T> {
    Number::new(message)
}

pub fn editor(message: impl Into<String>) -> Editor {
    Editor::new(message)
}

pub fn path(message: impl Into<String>) -> PathPrompt {
    PathPrompt::new(message)
}

pub fn auto_complete(message: impl Into<String>, source: impl CompletionSource + 'static) -> AutoComplete {
    AutoComplete::new(message, source)
}
