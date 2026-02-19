const KEY_LAST_PROJECT_ROOT: &str = "ide.last_project_root";
const KEY_APP_CONFIG_JSON: &str = "ide.app_config_json";

pub fn load_last_project_root(storage: &dyn eframe::Storage) -> Option<String> {
    storage.get_string(KEY_LAST_PROJECT_ROOT)
}

#[cfg(any())]
pub fn save_last_project_root(storage: &mut dyn eframe::Storage, root: Option<&str>) {
    let value = root.unwrap_or_default().to_string();
    storage.set_string(KEY_LAST_PROJECT_ROOT, value);
}

pub fn load_app_config_json(storage: &dyn eframe::Storage) -> Option<String> {
    storage.get_string(KEY_APP_CONFIG_JSON)
}

#[cfg(any())]
pub fn save_app_config_json(storage: &mut dyn eframe::Storage, json: &str) {
    storage.set_string(KEY_APP_CONFIG_JSON, json.to_string());
}
