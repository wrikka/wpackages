// Plugin loader

use std::path::Path;

/// Plugin loader
pub struct PluginLoader {
    plugin_dir: std::path::PathBuf,
}

impl PluginLoader {
    pub fn new(plugin_dir: &Path) -> Self {
        PluginLoader {
            plugin_dir: plugin_dir.to_path_buf(),
        }
    }

    pub fn load_plugins(&self) -> Result<Vec<Box<dyn super::Plugin>>, Box<dyn std::error::Error>> {
        let mut plugins = Vec::new();

        // Scan plugin directory for plugin manifests
        if self.plugin_dir.exists() {
            for entry in std::fs::read_dir(&self.plugin_dir)? {
                let entry = entry?;
                let path = entry.path();

                if path.is_dir() {
                    // Load plugin from directory
                    // For now, skip as stub
                }
            }
        }

        Ok(plugins)
    }
}
