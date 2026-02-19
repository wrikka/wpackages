use crate::app::session_manager::SessionManager;
use crate::services::command_service::CommandService;
use crate::services::config_service::ConfigService;
use crate::services::pty_service::{PtyEventCallbacks as PtyServiceCallbacks, PtyService};
use crate::services::session_service::SessionService;
use crate::services::tab_service::TabService;
use crate::types::{ExitEvent, Hyperlink, PtyConfig, ShellIntegrationEvent};
use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use std::sync::Arc;
use tokio::sync::mpsc;

// Type aliases for event handlers
type OnDataHandler = Box<dyn Fn(Vec<u8>) + Send + Sync>;
type OnExitHandler = Box<dyn Fn(ExitEvent) + Send + Sync>;

// Callbacks for N-API (Node.js) environment
pub struct PtyAppCallbacks {
    pub on_data: ThreadsafeFunction<Vec<u8>>,
    pub on_exit: ThreadsafeFunction<ExitEvent>,
    pub on_title_change: ThreadsafeFunction<String>,
    pub on_hyperlink: ThreadsafeFunction<Hyperlink>,
    pub on_shell_event: ThreadsafeFunction<ShellIntegrationEvent>,
    pub on_sixel: ThreadsafeFunction<Vec<u8>>,
}

// Callbacks for native Rust environment
#[derive(Clone)]
pub struct NativePtyAppCallbacks {
    pub on_data: Arc<dyn Fn(u32, Vec<u8>) + Send + Sync>,
    pub on_exit: Arc<dyn Fn(u32, ExitEvent) + Send + Sync>,
    pub on_title_change: Arc<dyn Fn(u32, String) + Send + Sync>,
    pub on_hyperlink: Arc<dyn Fn(u32, Hyperlink) + Send + Sync>,
    pub on_shell_event: Arc<dyn Fn(u32, ShellIntegrationEvent) + Send + Sync>,
    pub on_sixel: Arc<dyn Fn(u32, Vec<u8>) + Send + Sync>,
}

#[derive(Clone)]
pub struct PtyApp {
    pub session_manager: SessionManager,
    pub config_service: ConfigService,
    pub command_service: CommandService,
    pub session_service: SessionService,
    pub tab_service: TabService,
}

impl PtyApp {
    pub fn new() -> Self {
        let config_service = ConfigService::new();
        config_service.watch();

        Self {
            session_manager: SessionManager::new(),
            config_service,
            command_service: CommandService::new(),
            session_service: SessionService::new(),
            tab_service: TabService::new(),
        }
    }

    // This is the core, shared logic for spawning a PTY session.
    // It's kept private and used by both the N-API and native Rust spawn methods.
    pub(crate) async fn _spawn_pty(
        &self,
        config: PtyConfig,
        pty_callbacks: PtyServiceCallbacks,
        native_callbacks: Option<NativePtyAppCallbacks>,
        napi_on_data: Option<ThreadsafeFunction<Vec<u8>>>,
        napi_on_exit: Option<ThreadsafeFunction<ExitEvent>>,
    ) -> Result<u32, crate::error::AppError> {
        let session_id = self.session_manager.next_id();
        tracing::info!("Spawning new pty session with id: {}", session_id);

        let (data_tx, mut data_rx) = mpsc::channel::<Vec<u8>>(100);

        let session = PtyService::spawn(&config, data_tx, pty_callbacks).await?;
        let session = Arc::new(session);
        self.session_manager
            .add(session_id, Arc::clone(&session), config.clone())
            .await;

        tracing::info!(
            "Pty session {} spawned successfully with PID: {}",
            session_id,
            session.pid
        );

        // Determine which event handlers to use
        let (on_data_handler, on_exit_handler): (OnDataHandler, OnExitHandler) = if let Some(cb) = native_callbacks {
            (
                Box::new(move |data| (cb.on_data)(session_id, data)),
                Box::new(move |event| (cb.on_exit)(session_id, event)),
            )
        } else if let (Some(on_data), Some(on_exit)) = (napi_on_data, napi_on_exit) {
            (
                Box::new(move |data| {
                    on_data.call(Ok(data), ThreadsafeFunctionCallMode::Blocking);
                }),
                Box::new(move |event| {
                    on_exit.call(Ok(event), ThreadsafeFunctionCallMode::Blocking);
                }),
            )
        } else {
            // No callbacks provided, so we can't handle events.
            // This case should ideally not be reached if the API is used correctly.
            return Ok(session_id);
        };

        // Spawn a single task to handle both data and exit events
        let session_manager_clone = self.session_manager.clone();
        tokio::spawn(async move {
            let mut exit_rx = session.exit_rx.lock().await;
            loop {
                tokio::select! {
                    Some(data) = data_rx.recv() => {
                        on_data_handler(data);
                    },
                    Some(event) = exit_rx.recv() => {
                        on_exit_handler(event.clone());
                        session_manager_clone.remove(session_id).await;
                        break; // Exit the loop once the session has ended
                    },
                    else => break, // Both channels are closed
                }
            }
        });

        Ok(session_id)
    }

        pub async fn spawn_native(
        &self,
        config: PtyConfig,
        callbacks: NativePtyAppCallbacks,
    ) -> Result<u32, crate::error::AppError> {
                let callbacks_clone = callbacks.clone();
        let pty_callbacks = PtyServiceCallbacks {
            on_title_change: Box::new(move |title: String| {
                (callbacks_clone.on_title_change)(0, title);
            }),
            on_hyperlink: Box::new(move |hyperlink: Hyperlink| {
                (callbacks_clone.on_hyperlink)(0, hyperlink);
            }),
            on_shell_event: Box::new(move |event: ShellIntegrationEvent| {
                (callbacks_clone.on_shell_event)(0, event);
            }),
            on_sixel: Box::new(move |payload: Vec<u8>| {
                (callbacks_clone.on_sixel)(0, payload);
            }),
        };

        self._spawn_pty(config, pty_callbacks, Some(callbacks), None, None).await
    }

    pub fn start_watchers(&self) {
        // Spawn a task to listen for config changes and reload commands
        let mut rx = self.config_service.subscribe();
        let cs_clone = self.config_service.clone();
        let cmds_clone = self.command_service.clone();
        tokio::spawn(async move {
            // Initial load
            let config = cs_clone.get_config().await;
            cmds_clone.load_commands(&config).await;

            // Listen for reloads
            loop {
                if rx.recv().await.is_ok() {
                    let config = cs_clone.get_config().await;
                    cmds_clone.load_commands(&config).await;
                } else {
                    break;
                }
            }
        });
    }
}

impl Default for PtyApp {
    fn default() -> Self {
        Self::new()
    }
}
