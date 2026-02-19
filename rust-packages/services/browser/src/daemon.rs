use crate::browser::BrowserManager;
use crate::error::{Error, Result};
use crate::ipc::IpcServer;
use crate::monitoring::{self, setup_metrics_recorder};
use crate::protocol::{Action, Command, Params, Response};
use std::net::SocketAddr;
use std::sync::Arc;
use tracing::{debug, error, info, warn};

pub struct Daemon {
    server: IpcServer,
    browser_manager: Arc<BrowserManager>,
    addr: String,
    metrics_addr: String,
}

impl Daemon {
    pub async fn new(addr: String, metrics_addr: Option<String>) -> Result<Self> {
        let metrics_addr = metrics_addr.unwrap_or_else(|| "0.0.0.0:9090".to_string());
        let server = IpcServer::bind(&addr).await?;
        let browser_manager = Arc::new(BrowserManager::new());

        Ok(Self {
            server,
            browser_manager,
            addr,
            metrics_addr,
        })
    }

    pub async fn run(&self) -> Result<()> {
        let metrics_handle = setup_metrics_recorder()?;
        let metrics_addr: SocketAddr = self.metrics_addr.parse().map_err(|e| Error::Other(format!("Invalid metrics address: {}", e)))?;
        tokio::spawn(monitoring::start_metrics_server(metrics_addr, metrics_handle));

        info!("Daemon listening on {}", self.addr);

        loop {
            tokio::select! {
                _ = tokio::signal::ctrl_c() => {
                    info!("Shutting down daemon...");
                    break;
                }
                result = self.server.accept() => {
                    match result {
                Ok((mut connection, addr)) => {
                    metrics::counter!("connections_total").increment(1);
                    info!(client = %addr, "Client connected");

                    let browser_manager = self.browser_manager.clone();

                    tokio::spawn(async move {
                        if let Err(e) = Self::handle_client(browser_manager, &mut connection).await {
                            error!(client = %addr, error = %e, "Error handling client");
                        }
                        info!(client = %addr, "Client disconnected");
                    });
                }
                        Err(e) => {
                            error!(error = %e, addr = %self.addr, "Failed to accept incoming connection");
                        }
                    }
                }
            }
        }
        Ok(())
    }

    async fn handle_client<T: crate::ipc::transport::Transport>(browser_manager: Arc<BrowserManager>, connection: &mut crate::ipc::IpcConnection<T>) -> Result<()> {
        while let Ok(command) = connection.receive_command().await {
            let mut command_for_log = command.clone();
            if let Params::TypeSecret(ref mut params) = command_for_log.params {
                params.text = "[REDACTED]".to_string();
            }
            debug!(?command_for_log, "Received command");
            metrics::counter!("commands_processed_total", "action" => command.action.to_string()).increment(1);

            let response = Self::execute_command(browser_manager.clone(), command).await;

            debug!(?response, "Sending response");
            if let Err(e) = connection.send_response(&response).await {
                error!(error = %e, "Failed to send response");
                break;
            }
        }
        Ok(())
    }

    async fn execute_command(browser_manager: Arc<BrowserManager>, command: Command) -> Response {
        let params_json = match serde_json::to_value(&command.params) {
            Ok(value) => value,
            Err(e) => {
                return Response::error(command.id, format!("Failed to serialize params: {}", e));
            }
        };

        let (session, headless, datadir, stealth) = Self::extract_context(&params_json);

        match browser_manager
            .execute_action(&session, headless, datadir.as_deref(), stealth, command.action, command.params)
            .await
        {
            Ok(response) => response,
            Err(e) => {
                error!(error = %e, "Action execution failed");
                Response::error(command.id, e.to_string())
            }
        }
    }
}

impl Daemon {
    fn extract_context(params: &serde_json::Value) -> (String, bool, Option<String>, bool) {
        let default_session = "default".to_string();
        let default_headless = true;

        if let Some(context) = params.get("__context") {
            let session = context.get("session").and_then(|s| s.as_str()).map(|s| s.to_string()).unwrap_or(default_session);
            let headless = context.get("headless").and_then(|h| h.as_bool()).unwrap_or(default_headless);
            let datadir = context.get("datadir").and_then(|d| d.as_str()).map(|s| s.to_string());
            let stealth = context.get("stealth").and_then(|s| s.as_bool()).unwrap_or(false);

            (session, headless, datadir, stealth)
        } else {
            (default_session, default_headless, None, false)
        }
    }
}
