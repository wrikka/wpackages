use crate::app::state::{extensions::ExtensionRuntime, IdeState};
use ::extensions::types::ExtensionId;

pub fn install_extension(state: &mut IdeState, id: &str) {
    let id = ExtensionId::new(id);
    let entry = state
        .core
        .extensions
        .extension_runtime
        .entry(id)
        .or_insert(ExtensionRuntime {
            installed: false,
            enabled: false,
        });

    if !entry.installed {
        entry.installed = true;
        entry.enabled = true;
        state.core.ui.notifications = state.core.ui.notifications.saturating_add(1);
    }
}

pub fn uninstall_extension(state: &mut IdeState, id: &str) {
    let id = ExtensionId::new(id);
    if let Some(rt) = state.core.extensions.extension_runtime.get_mut(&id) {
        if rt.installed {
            rt.installed = false;
            rt.enabled = false;
            state.core.ui.notifications = state.core.ui.notifications.saturating_add(1);
        }
    }
}

pub fn toggle_extension_enabled(state: &mut IdeState, id: &str) {
    let id = ExtensionId::new(id);
    if let Some(rt) = state.core.extensions.extension_runtime.get_mut(&id) {
        if rt.installed {
            rt.enabled = !rt.enabled;
            state.core.ui.notifications = state.core.ui.notifications.saturating_add(1);
        }
    }
}
