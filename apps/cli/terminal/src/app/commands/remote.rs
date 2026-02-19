use crate::services::remote_multiplexer::*;

#[tauri::command]
pub async fn create_domain(
    name: String,
    host: String,
    port: u16,
    username: String,
    auth_method_json: String,
) -> Result<String, String> {
    let multiplexer = RemoteMultiplexer::default();
    let auth_method: crate::services::ssh::AuthMethod =
        serde_json::from_str(&auth_method_json).map_err(|e| e.to_string())?;

    let domain = Domain {
        id: nanoid::nanoid!(),
        name,
        host,
        port,
        username,
        auth_method,
        created_at: chrono::Utc::now(),
        last_connected: None,
    };

    multiplexer
        .create_domain(domain)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn connect_domain(domain_id: String) -> Result<String, String> {
    let multiplexer = RemoteMultiplexer::default();
    let connection_id = multiplexer
        .connect(&domain_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(connection_id.to_string())
}

#[tauri::command]
pub async fn disconnect_connection(connection_id: String) -> Result<(), String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&connection_id).map_err(|e| e.to_string())?;
    multiplexer.disconnect(id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_domains() -> Result<Vec<Domain>, String> {
    let multiplexer = RemoteMultiplexer::default();
    Ok(multiplexer.get_domains())
}

#[tauri::command]
pub async fn get_connections() -> Result<Vec<RemoteConnection>, String> {
    let multiplexer = RemoteMultiplexer::default();
    Ok(multiplexer.get_connections())
}

#[tauri::command]
pub async fn create_remote_pane(
    connection_id: String,
    pane_type_json: String,
    shell: String,
    rows: u16,
    cols: u16,
) -> Result<String, String> {
    let multiplexer = RemoteMultiplexer::default();
    let pane_type: PaneType = serde_json::from_str(&pane_type_json).map_err(|e| e.to_string())?;
    let id = uuid::Uuid::parse_str(&connection_id).map_err(|e| e.to_string())?;

    let size = PaneSize { rows, cols };
    let pane_id = multiplexer
        .create_pane(id, pane_type, shell, size)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pane_id.to_string())
}

#[tauri::command]
pub async fn send_remote_input(pane_id: String, data: String) -> Result<(), String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&pane_id).map_err(|e| e.to_string())?;
    multiplexer
        .send_input(id, data.as_bytes())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resize_remote_pane(pane_id: String, rows: u16, cols: u16) -> Result<(), String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&pane_id).map_err(|e| e.to_string())?;
    let size = PaneSize { rows, cols };
    multiplexer
        .resize_pane(id, size)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn destroy_remote_pane(pane_id: String) -> Result<(), String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&pane_id).map_err(|e| e.to_string())?;
    multiplexer
        .destroy_pane(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn persist_remote_session(session_id: String) -> Result<(), String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    multiplexer
        .persist_session(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_remote_session(session_id: String) -> Result<MultiplexedSession, String> {
    let multiplexer = RemoteMultiplexer::default();
    let id = uuid::Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    multiplexer
        .restore_session(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_persisted_sessions() -> Result<Vec<String>, String> {
    let multiplexer = RemoteMultiplexer::default();
    let sessions = multiplexer
        .list_persisted_sessions()
        .await
        .map_err(|e| e.to_string())?;
    Ok(sessions.into_iter().map(|id| id.to_string()).collect())
}
