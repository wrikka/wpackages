use crate::error::Result;
use crate::theme::Theme;
use crossterm::cursor;
use crossterm::execute;
use crossterm::style::{Print, Stylize};
use crossterm::terminal::{Clear, ClearType};
use std::io::{self, Write};

/// Render engine for terminal output
pub struct RenderEngine {
    theme: Theme,
}

impl RenderEngine {
    pub fn new(theme: Theme) -> Self {
        Self { theme }
    }

    /// Clear screen
    pub fn clear(&self) -> Result<()> {
        execute!(io::stdout(), Clear(ClearType::All))?;
        Ok(())
    }

    /// Clear current line
    pub fn clear_line(&self) -> Result<()> {
        execute!(io::stdout(), Clear(ClearType::CurrentLine))?;
        execute!(io::stdout(), cursor::MoveToColumn(0))?;
        Ok(())
    }

    /// Print with theme
    pub fn print(&self, text: impl AsRef<str>) -> Result<()> {
        execute!(io::stdout(), Print(text.as_ref()))?;
        io::stdout().flush()?;
        Ok(())
    }

    /// Print styled text
    pub fn print_styled(&self, text: impl AsRef<str>, color: crossterm::style::Color) -> Result<()> {
        let styled = text.as_ref().stylize().with(color);
        execute!(io::stdout(), Print(styled))?;
        io::stdout().flush()?;
        Ok(())
    }

    /// Print prompt prefix
    pub fn print_prefix(&self, active: bool) -> Result<()> {
        let symbol = if active {
            self.theme.symbols.pointer.stylize().with(self.theme.colors.primary)
        } else {
            self.theme.symbols.bar.stylize().with(self.theme.colors.muted)
        };
        execute!(io::stdout(), Print(symbol), Print(" "))?;
        Ok(())
    }

    /// Move cursor
    pub fn move_cursor(&self, x: u16, y: u16) -> Result<()> {
        execute!(io::stdout(), cursor::MoveTo(x, y))?;
        Ok(())
    }

    /// Hide cursor
    pub fn hide_cursor(&self) -> Result<()> {
        execute!(io::stdout(), cursor::Hide)?;
        Ok(())
    }

    /// Show cursor
    pub fn show_cursor(&self) -> Result<()> {
        execute!(io::stdout(), cursor::Show)?;
        Ok(())
    }
}

/// Terminal renderer for prompts
pub struct TerminalRenderer {
    engine: RenderEngine,
    width: u16,
    height: u16,
}

impl TerminalRenderer {
    pub fn new(theme: Theme) -> Result<Self> {
        let (width, height) = crossterm::terminal::size()?;
        Ok(Self {
            engine: RenderEngine::new(theme),
            width,
            height,
        })
    }

    /// Get terminal width
    pub fn width(&self) -> u16 {
        self.width
    }

    /// Get terminal height
    pub fn height(&self) -> u16 {
        self.height
    }

    /// Refresh size
    pub fn refresh_size(&mut self) -> Result<()> {
        let (width, height) = crossterm::terminal::size()?;
        self.width = width;
        self.height = height;
        Ok(())
    }

    /// Render input line
    pub fn render_input(&self, prompt: &str, value: &str, cursor_pos: usize, secret: bool) -> Result<()> {
        self.engine.clear_line()?;
        self.engine.print_prefix(true)?;
        
        // Print prompt
        self.engine.print(format!("{}: ", prompt))?;
        
        // Print value (masked if secret)
        if secret {
            self.engine.print("*".repeat(value.len()))?;
        } else {
            self.engine.print(value)?;
        }
        
        // Position cursor
        let prompt_len = prompt.len() + 3; // "? : "
        self.engine.move_cursor(prompt_len as u16 + cursor_pos as u16, 0)?;
        
        Ok(())
    }

    /// Render select list
    pub fn render_select(&self, prompt: &str, options: &[String], selected: usize, offset: usize) -> Result<()> {
        self.engine.clear()?;
        
        // Print prompt
        self.engine.print_prefix(true)?;
        self.engine.print_styled(prompt, self.engine.theme.colors.primary)?;
        self.engine.print("\n\n")?;
        
        // Calculate visible range
        let visible_count = (self.height as usize).saturating_sub(4);
        let start = offset;
        let end = (start + visible_count).min(options.len());
        
        // Print options
        for (i, option) in options.iter().enumerate().skip(start).take(end - start) {
            if i == selected {
                self.engine.print_prefix(true)?;
                let radio = self.engine.theme.symbols.radio_on;
                let styled = format!("{} {}\n", radio, option)
                    .stylize()
                    .with(self.engine.theme.colors.primary);
                self.engine.print(styled)?;
            } else {
                self.engine.print_prefix(false)?;
                let radio = self.engine.theme.symbols.radio_off;
                let styled = format!("{} {}\n", radio, option)
                    .stylize()
                    .with(self.engine.theme.colors.muted);
                self.engine.print(styled)?;
            }
        }
        
        // Print hint
        if options.len() > visible_count {
            self.engine.print(format!("\n{} ({} more)", 
                self.engine.theme.symbols.bar,
                options.len() - end
            ))?;
        }
        
        Ok(())
    }

    /// Render multi-select list
    pub fn render_multi_select(&self, prompt: &str, options: &[String], selected: &[bool], cursor: usize) -> Result<()> {
        self.engine.clear()?;
        
        // Print prompt
        self.engine.print_prefix(true)?;
        self.engine.print_styled(prompt, self.engine.theme.colors.primary)?;
        self.engine.print("\n\n")?;
        
        // Print options
        for (i, option) in options.iter().enumerate() {
            let is_selected = selected.get(i).copied().unwrap_or(false);
            let is_cursor = i == cursor;
            
            let checkbox = if is_selected {
                self.engine.theme.symbols.checkbox_on
            } else {
                self.engine.theme.symbols.checkbox_off
            };
            
            if is_cursor {
                self.engine.print_prefix(true)?;
                let styled = format!("{} {}\n", checkbox, option)
                    .stylize()
                    .with(self.engine.theme.colors.primary);
                self.engine.print(styled)?;
            } else {
                self.engine.print_prefix(false)?;
                let styled = format!("{} {}\n", checkbox, option)
                    .stylize()
                    .with(self.engine.theme.colors.muted);
                self.engine.print(styled)?;
            }
        }
        
        // Print hint
        self.engine.print(format!("\n{} Press <space> to toggle, <enter> to confirm", 
            self.engine.theme.symbols.corner
        ))?;
        
        Ok(())
    }

    /// Render confirmation
    pub fn render_confirm(&self, prompt: &str, default: Option<bool>) -> Result<()> {
        self.engine.clear_line()?;
        self.engine.print_prefix(true)?;
        
        let hint = match default {
            Some(true) => " (Y/n)",
            Some(false) => " (y/N)",
            None => " (y/n)",
        };
        
        self.engine.print(format!("{}{}: ", prompt, hint))?;
        Ok(())
    }

    /// Render result
    pub fn render_result(&self, label: &str, value: &str) -> Result<()> {
        self.engine.print(format!("\n{} {} {}: ",
            self.engine.theme.symbols.corner,
            self.engine.theme.symbols.check,
            label
        ))?;
        self.engine.print_styled(value, self.engine.theme.colors.success)?;
        self.engine.print("\n")?;
        Ok(())
    }
}
