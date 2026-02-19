use crate::error::AppError;

use tauri::{GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};

pub fn run() -> Result<(), AppError> {
    let tray_menu = SystemTrayMenu::new()
        .add_item(tauri::CustomMenuItem::new("show", "Show"))
        .add_item(tauri::CustomMenuItem::new("hide", "Hide"))
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(tauri::CustomMenuItem::new("quit", "Quit"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    use crate::pty::{pty_init, pty_write, pty_resize, pty_close};

tauri::Builder::default()
        .manage(terminal::services::pty_service::PtyManager::default())
        .invoke_handler(tauri::generate_handler![
            pty_init,
            pty_write,
            pty_resize,
            pty_close
        ])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .setup(|app| {
            let handle = app.handle();
            let mut shortcuts = handle.global_shortcut_manager();
            shortcuts.register("CmdOrCtrl+Shift+C", move || {
                println!("Global shortcut triggered!");
                // Here you can toggle the window visibility or perform other actions
                let window = handle.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }).map_err(|e| AppError::Tauri(e.to_string()))?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .map_err(|e| AppError::Tauri(e.to_string()))?;
    Ok(())
}
