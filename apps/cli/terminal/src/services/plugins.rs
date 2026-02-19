use anyhow::{Context, Result};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use wasmtime::*;
use wasmtime_wasi::{WasiCtx, WasiCtxBuilder};

#[derive(Debug, Clone)]
pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub entry_point: String,
}

#[derive(Debug, Clone)]
pub struct Plugin {
    pub metadata: PluginMetadata,
    pub instance: Arc<Instance>,
    pub module: Arc<Module>,
    pub store: Arc<RwLock<Store<WasiCtx>>>,
    pub enabled: bool,
}

pub struct PluginManager {
    plugins: Arc<RwLock<HashMap<String, Plugin>>>,
    engine: Engine,
    plugin_dir: PathBuf,
}

impl PluginManager {
    pub fn new(plugin_dir: PathBuf) -> Result<Self> {
        let mut config = Config::new();
        config.wasm_component_model(false);
        config.async_support(false);
        config.consume_fuel(true);

        let engine = Engine::new(&config)?;

        Ok(Self {
            plugins: Arc::new(RwLock::new(HashMap::new())),
            engine,
            plugin_dir,
        })
    }

    pub async fn load_plugin(&self, wasm_path: PathBuf) -> Result<PluginMetadata> {
        let wasm_bytes = std::fs::read(&wasm_path).context("Failed to read WASM file")?;

        let module = Module::from_binary(&self.engine, &wasm_bytes)?;

        let wasi = WasiCtxBuilder::new().inherit_stdio().build();

        let mut store = Store::new(&self.engine, wasi);
        store.set_fuel(1_000_000)?;

        let instance = Instance::new(&mut store, &module, &[])?;

        let metadata = self.extract_metadata(&instance, &mut store)?;

        let plugin = Plugin {
            metadata: metadata.clone(),
            instance: Arc::new(instance),
            module: Arc::new(module),
            store: Arc::new(RwLock::new(store)),
            enabled: true,
        };

        self.plugins.write().insert(metadata.id.clone(), plugin);

        Ok(metadata)
    }

    pub async fn unload_plugin(&self, plugin_id: &str) -> Result<()> {
        self.plugins.write().remove(plugin_id);
        Ok(())
    }

    pub fn call_plugin(&self, plugin_id: &str, func_name: &str, args: &[Val]) -> Result<Vec<Val>> {
        let plugins = self.plugins.read();
        let plugin = plugins
            .get(plugin_id)
            .ok_or_else(|| anyhow::anyhow!("Plugin not found: {}", plugin_id))?;

        if !plugin.enabled {
            return Err(anyhow::anyhow!("Plugin is disabled: {}", plugin_id));
        }

        let mut store = plugin.store.write();
        store.set_fuel(1_000_000)?;

        let func = plugin
            .instance
            .get_typed_func::<(i32, i32), i32>(&mut store, func_name)?;

        let result = func.call(&mut store, args[0].unwrap_i32(), args[1].unwrap_i32())?;

        Ok(vec![Val::I32(result)])
    }

    pub fn list_plugins(&self) -> Vec<PluginMetadata> {
        self.plugins
            .read()
            .values()
            .filter(|p| p.enabled)
            .map(|p| p.metadata.clone())
            .collect()
    }

    pub fn get_plugin(&self, plugin_id: &str) -> Option<PluginMetadata> {
        self.plugins
            .read()
            .get(plugin_id)
            .filter(|p| p.enabled)
            .map(|p| p.metadata.clone())
    }

    pub fn enable_plugin(&self, plugin_id: &str) -> Result<()> {
        if let Some(plugin) = self.plugins.write().get_mut(plugin_id) {
            plugin.enabled = true;
        }
        Ok(())
    }

    pub fn disable_plugin(&self, plugin_id: &str) -> Result<()> {
        if let Some(plugin) = self.plugins.write().get_mut(plugin_id) {
            plugin.enabled = false;
        }
        Ok(())
    }

    pub async fn install_from_marketplace(&self, plugin_id: &str) -> Result<PluginMetadata> {
        let url = format!("https://plugins.terminal.app/api/v1/plugins/{}", plugin_id);

        let response = reqwest::get(&url).await?.error_for_status()?;

        let plugin_data: serde_json::Value = response.json().await?;

        let wasm_url = plugin_data["wasm_url"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("No wasm_url in plugin data"))?;

        let wasm_bytes = reqwest::get(wasm_url).await?.bytes().await?.to_vec();

        let plugin_path = self.plugin_dir.join(format!("{}.wasm", plugin_id));
        std::fs::write(&plugin_path, wasm_bytes)?;

        self.load_plugin(plugin_path).await
    }

    fn extract_metadata(
        &self,
        instance: &Instance,
        store: &mut Store<WasiCtx>,
    ) -> Result<PluginMetadata> {
        let get_metadata = instance.get_typed_func::<(), i32>(store, "get_metadata")?;

        let result = get_metadata.call(store)?;

        Ok(PluginMetadata {
            id: nanoid::nanoid!(),
            name: "Unknown".to_string(),
            version: "0.0.0".to_string(),
            author: "Unknown".to_string(),
            description: "".to_string(),
            permissions: vec![],
            entry_point: "run".to_string(),
        })
    }

    pub fn get_fuel_consumed(&self, plugin_id: &str) -> Result<u64> {
        let plugins = self.plugins.read();
        let plugin = plugins
            .get(plugin_id)
            .ok_or_else(|| anyhow::anyhow!("Plugin not found: {}", plugin_id))?;

        let store = plugin.store.read();
        Ok(store.fuel_consumed())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_plugin_manager() {
        let plugin_dir = std::env::temp_dir().join("terminal-plugins");
        std::fs::create_dir_all(&plugin_dir).unwrap();

        let manager = PluginManager::new(plugin_dir).unwrap();
        assert_eq!(manager.list_plugins().len(), 0);
    }
}
