use crate::error::Result;
use crate::theme::{SymbolSet, Theme};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tokio::time::sleep;

/// Spinner for loading states
pub struct Spinner {
    message: String,
    frames: &'static [&'static str],
    delay: Duration,
    theme: Theme,
    running: Arc<Mutex<bool>>,
    task: Option<JoinHandle<()>>,
}

impl Spinner {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            frames: SymbolSet::default().spinner,
            delay: Duration::from_millis(80),
            theme: Theme::default(),
            running: Arc::new(Mutex::new(false)),
            task: None,
        }
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.frames = theme.symbols.spinner;
        self.theme = theme;
        self
    }

    pub fn with_frames(mut self, frames: &'static [&'static str]) -> Self {
        self.frames = frames;
        self
    }

    pub fn with_delay(mut self, delay: Duration) -> Self {
        self.delay = delay;
        self
    }

    /// Start the spinner
    pub async fn start(&mut self) -> Result<()> {
        let running = self.running.clone();
        let frames = self.frames;
        let delay = self.delay;
        let message = self.message.clone();
        let theme = self.theme.clone();

        *running.lock().await = true;

        let task = tokio::spawn(async move {
            let mut frame_idx = 0;
            let start = Instant::now();

            loop {
                if !*running.lock().await {
                    break;
                }

                let frame = frames[frame_idx % frames.len()];
                let elapsed = start.elapsed().as_secs();

                // Clear line and print spinner
                print!("\r\x1B[K"); // Clear line
                print!(
                    "{} {} {}",
                    theme.symbols.bar.stylize().with(theme.colors.primary),
                    frame.stylize().with(theme.colors.primary),
                    message
                );
                std::io::Write::flush(&mut std::io::stdout()).unwrap();

                frame_idx += 1;
                sleep(delay).await;
            }

            // Clear the spinner line
            print!("\r\x1B[K");
        });

        self.task = Some(task);
        Ok(())
    }

    /// Update message while spinning
    pub async fn message(&mut self, message: impl Into<String>) {
        self.message = message.into();
    }

    /// Stop with success
    pub async fn stop(&mut self, message: impl Into<String>) -> Result<()> {
        self.finish(message, "success").await
    }

    /// Stop with error
    pub async fn error(&mut self, message: impl Into<String>) -> Result<()> {
        self.finish(message, "error").await
    }

    /// Stop with warning
    pub async fn warn(&mut self, message: impl Into<String>) -> Result<()> {
        self.finish(message, "warn").await
    }

    /// Stop without message
    pub async fn stop_silent(&mut self) -> Result<()> {
        *self.running.lock().await = false;
        if let Some(task) = self.task.take() {
            task.await?;
        }
        Ok(())
    }

    async fn finish(&mut self, message: impl Into<String>, status: &str) -> Result<()> {
        *self.running.lock().await = false;
        if let Some(task) = self.task.take() {
            task.await?;
        }

        let symbol = match status {
            "success" => self.theme.symbols.check.stylize().with(self.theme.colors.success),
            "error" => self.theme.symbols.cross.stylize().with(self.theme.colors.error),
            "warn" => "⚠".stylize().with(self.theme.colors.warning),
            _ => self.theme.symbols.check.stylize().with(self.theme.colors.success),
        };

        println!(
            "{} {} {}",
            self.theme.symbols.bar.stylize().with(self.theme.colors.primary),
            symbol,
            message.into()
        );

        Ok(())
    }
}

impl Drop for Spinner {
    fn drop(&mut self) {
        if self.task.is_some() {
            let running = self.running.clone();
            tokio::spawn(async move {
                *running.lock().await = false;
            });
        }
    }
}

/// Progress bar for long operations
pub struct ProgressBar {
    total: u64,
    current: Arc<Mutex<u64>>,
    message: String,
    width: usize,
    theme: Theme,
    start_time: Instant,
}

impl ProgressBar {
    pub fn new(total: u64) -> Self {
        Self {
            total,
            current: Arc::new(Mutex::new(0)),
            message: String::new(),
            width: 40,
            theme: Theme::default(),
            start_time: Instant::now(),
        }
    }

    pub fn with_message(mut self, message: impl Into<String>) -> Self {
        self.message = message.into();
        self
    }

    pub fn with_width(mut self, width: usize) -> Self {
        self.width = width;
        self
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    /// Increment progress
    pub async fn inc(&self, delta: u64) {
        let mut current = self.current.lock().await;
        *current = (*current + delta).min(self.total);
        self.render(*current).await;
    }

    /// Set progress position
    pub async fn set_position(&self, pos: u64) {
        let mut current = self.current.lock().await;
        *current = pos.min(self.total);
        self.render(*current).await;
    }

    /// Finish progress
    pub async fn finish(&self) {
        self.set_position(self.total).await;
        println!(); // New line after progress
    }

    /// Finish with message
    pub async fn finish_with_message(&self, message: impl Into<String>) {
        self.finish().await;
        println!(
            "{} {} {}",
            self.theme.symbols.bar.stylize().with(self.theme.colors.primary),
            self.theme.symbols.check.stylize().with(self.theme.colors.success),
            message.into()
        );
    }

    async fn render(&self, current: u64) {
        let percentage = if self.total > 0 {
            (current * 100) / self.total
        } else {
            0
        };

        let filled = if self.total > 0 {
            (current as usize * self.width) / self.total as usize
        } else {
            0
        };

        let bar = format!(
            "[{}{}]",
            "█".repeat(filled),
            "░".repeat(self.width - filled)
        );

        let elapsed = self.start_time.elapsed();
        let eta = if current > 0 && self.total > 0 {
            let rate = current as f64 / elapsed.as_secs_f64();
            let remaining = (self.total - current) as f64 / rate;
            format!("{:.0}s", remaining)
        } else {
            "?".to_string()
        };

        print!("\r\x1B[K");
        print!(
            "{} {} {}% {}/{} ETA: {}",
            self.theme.symbols.bar.stylize().with(self.theme.colors.primary),
            bar.stylize().with(self.theme.colors.primary),
            percentage,
            current,
            self.total,
            eta
        );

        if !self.message.is_empty() {
            print!(" - {}", self.message);
        }

        std::io::Write::flush(&mut std::io::stdout()).unwrap();
    }
}

/// Task group for parallel operations
pub struct TaskGroup {
    tasks: Vec<TaskInfo>,
    theme: Theme,
}

struct TaskInfo {
    name: String,
    status: TaskStatus,
}

#[derive(Clone, Copy, Debug)]
pub enum TaskStatus {
    Pending,
    Running,
    Success,
    Failed,
    Cancelled,
}

impl TaskGroup {
    pub fn new() -> Self {
        Self {
            tasks: Vec::new(),
            theme: Theme::default(),
        }
    }

    pub fn with_theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }

    pub fn add_task(mut self, name: impl Into<String>) -> Self {
        self.tasks.push(TaskInfo {
            name: name.into(),
            status: TaskStatus::Pending,
        });
        self
    }

    pub fn set_status(&mut self, index: usize, status: TaskStatus) {
        if let Some(task) = self.tasks.get_mut(index) {
            task.status = status;
        }
    }

    pub fn render(&self) {
        for task in &self.tasks {
            let symbol = match task.status {
                TaskStatus::Pending => "○".stylize().with(self.theme.colors.muted),
                TaskStatus::Running => "◐".stylize().with(self.theme.colors.primary),
                TaskStatus::Success => self.theme.symbols.check.stylize().with(self.theme.colors.success),
                TaskStatus::Failed => self.theme.symbols.cross.stylize().with(self.theme.colors.error),
                TaskStatus::Cancelled => "⊘".stylize().with(self.theme.colors.warning),
            };

            println!(
                "{} {} {}",
                self.theme.symbols.bar.stylize().with(self.theme.colors.primary),
                symbol,
                task.name
            );
        }
    }
}

impl Default for TaskGroup {
    fn default() -> Self {
        Self::new()
    }
}
