mod reader;

use crate::error::{AppError, Result};
use std::io::Read;
use crate::types::{ExitEvent, Hyperlink, PtyConfig, ShellIntegrationEvent};
use portable_pty::{Child, CommandBuilder, MasterPty, NativePtySystem, PtySize, PtySystem};
use std::env;
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Condvar, Mutex as StdMutex};
use tokio::sync::{mpsc, Mutex};
use tracing::{debug, info};

// Type alias for synchronization primitives
type SyncPrimitives = (
    Arc<(StdMutex<bool>, Condvar)>,
    Arc<AtomicBool>,
    Arc<AtomicBool>,
);

pub struct PtyEventCallbacks {
    pub on_title_change: Box<dyn Fn(String) + Send>,
    pub on_hyperlink: Box<dyn Fn(Hyperlink) + Send>,
    pub on_shell_event: Box<dyn Fn(ShellIntegrationEvent) + Send>,
    pub on_sixel: Box<dyn Fn(Vec<u8>) + Send>,
}

pub struct PtyService {
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    pub exit_rx: Arc<Mutex<mpsc::Receiver<ExitEvent>>>,
    pub pid: u32,
    child: Arc<Mutex<Box<dyn Child + Send + Sync>>>,
    pub process: String,
    pause_gate: Arc<(StdMutex<bool>, Condvar)>,
    is_closed: Arc<AtomicBool>,
    kill_requested: Arc<AtomicBool>,
    pub cwd: Arc<Mutex<String>>,
}

impl PtyService {
    pub async fn spawn(
        config: &PtyConfig,
        data_tx: mpsc::Sender<Vec<u8>>,
        callbacks: PtyEventCallbacks,
    ) -> Result<Self> {
        let pair = Self::setup_pty(config)?;
        let (cmd, initial_cwd) = Self::setup_command(config);

        // Spawn the command
        let child = pair.slave.spawn_command(cmd).map_err(|e| AppError::Spawn(std::io::Error::other(e.to_string())))?;
        let pid = child.process_id().unwrap_or(0);
        let child = Arc::new(Mutex::new(child));

        let master = Arc::new(Mutex::new(pair.master));
        let (reader, writer, exit_rx) = Self::setup_io(&master).await?;
        let (pause_gate, is_closed, kill_requested) = Self::setup_sync();

        let cwd = Arc::new(Mutex::new(initial_cwd.clone()));

        reader::spawn_reader_task(
            reader,
            data_tx,
            pause_gate.clone(),
            is_closed.clone(),
            callbacks,
            cwd.clone(),
            exit_rx.1.clone(),
        );

        let pty_service = Self {
            master,
            writer,
            exit_rx: Arc::new(Mutex::new(exit_rx.0)),
            pid,
            child,
            process: config.command.clone(),
            pause_gate,
            is_closed,
            kill_requested,
            cwd,
        };

        pty_service.spawn_exit_watcher_task(exit_rx.1);

        Ok(pty_service)
    }

    pub async fn write(&self, data: &[u8]) -> Result<()> {
        let mut writer = self.writer.lock().await;
        writer
            .write_all(data)
            .map_err(|e| AppError::write(format!("write_all: {}", e)))?;
        writer.flush().map_err(|e| AppError::write(format!("flush: {}", e)))?;
        Ok(())
    }

    pub async fn resize(&self, rows: u16, cols: u16) -> Result<()> {
        let master = self.master.lock().await;
        master
            .resize(PtySize {
                rows,
                cols,
                ..Default::default()
            })
            .map_err(|e| AppError::Resize(std::io::Error::other(e.to_string())))
    }

    pub async fn kill(&self) -> Result<()> {
        self.kill_requested.store(true, Ordering::Relaxed);
        let mut child = self.child.lock().await;
        child.kill().map_err(|e| AppError::Kill(std::io::Error::other(e.to_string())))
    }

    pub async fn close(&self) -> Result<()> {
        self.mark_closed();
        self.kill().await
    }

    pub fn process(&self) -> String {
        self.process.clone()
    }

    pub async fn get_size(&self) -> Result<PtySize> {
        let master = self.master.lock().await;
        master
            .get_size()
            .map_err(|e| AppError::GetSize(std::io::Error::other(e.to_string())))
    }

    pub fn pause(&self) {
        let (lock, _cvar) = &*self.pause_gate;
        if let Ok(mut paused) = lock.lock() {
            *paused = true;
        }
    }

    pub fn resume(&self) {
        let (lock, cvar) = &*self.pause_gate;
        if let Ok(mut paused) = lock.lock() {
            *paused = false;
        }
        cvar.notify_all();
    }

    pub fn mark_closed(&self) {
        self.is_closed.store(true, Ordering::Relaxed);
        self.resume();
    }

    pub async fn is_alive(&self) -> bool {
        match self.child.lock().await.try_wait() {
            Ok(Some(_)) => false, // Exited
            Ok(None) => true,     // Still running
            Err(_) => false,      // Error, assume not alive
        }
    }

    pub async fn cwd(&self) -> String {
        self.cwd.lock().await.clone()
    }

    // Helper functions for spawn

    fn setup_pty(config: &PtyConfig) -> Result<portable_pty::PtyPair> {
        let pty_system = NativePtySystem::default();
        pty_system
            .openpty(PtySize {
                rows: config.rows,
                cols: config.cols,
                ..Default::default()
            })
            .map_err(|e| AppError::OpenPty(std::io::Error::other(e.to_string())))
    }

    fn setup_command(config: &PtyConfig) -> (CommandBuilder, String) {
        let mut cmd = CommandBuilder::new(config.command.as_str());
        cmd.args(config.args.iter().map(|s: &String| s.as_str()));

        let initial_cwd = config
            .cwd
            .as_ref()
            .cloned()
            .unwrap_or_else(|| env::current_dir().unwrap().to_string_lossy().to_string());

        cmd.cwd(initial_cwd.as_str());
        (cmd, initial_cwd)
    }

    async fn setup_io(
        master: &Arc<Mutex<Box<dyn MasterPty + Send>>>,
    ) -> Result<(
        Box<dyn Read + Send>,
        Arc<Mutex<Box<dyn Write + Send>>>,
        (mpsc::Receiver<ExitEvent>, mpsc::Sender<ExitEvent>),
    )> {
        let master_lock = master.lock().await;
        let reader = master_lock.try_clone_reader().map_err(|e| AppError::Spawn(std::io::Error::other(e.to_string())))?;
        let writer = Arc::new(Mutex::new(master_lock.take_writer().map_err(|e| AppError::Spawn(std::io::Error::other(e.to_string())))?));
        let (exit_tx, exit_rx) = mpsc::channel::<ExitEvent>(1);
        Ok((reader, writer, (exit_rx, exit_tx)))
    }

    fn setup_sync() -> SyncPrimitives {
        let pause_gate = Arc::new((StdMutex::new(false), Condvar::new()));
        let is_closed = Arc::new(AtomicBool::new(false));
        let kill_requested = Arc::new(AtomicBool::new(false));
        (pause_gate, is_closed, kill_requested)
    }


    fn spawn_exit_watcher_task(&self, exit_tx: mpsc::Sender<ExitEvent>) {
        let child = self.child.clone();
        let kill_requested = self.kill_requested.clone();
        tokio::task::spawn_blocking(move || {
            debug!("Waiting for child process to exit...");

            let status = child.blocking_lock().wait();
            info!("Child process exited with status: {:?}", status);

            let event = match status {
                Ok(status) => {
                    let exit_code = status.exit_code();
                    let signal = status.signal().and_then(|s: &str| s.parse::<u32>().ok());
                    ExitEvent {
                        exit_code: exit_code as i32,
                        signal,
                        killed: Some(kill_requested.load(Ordering::Relaxed)),
                        error: None,
                    }
                }
                Err(e) => ExitEvent {
                    exit_code: -1,
                    signal: None,
                    killed: Some(kill_requested.load(Ordering::Relaxed)),
                    error: Some(e.to_string()),
                },
            };

            let _ = exit_tx.blocking_send(event);
        });
    }
}
