use std::collections::HashMap;

use ::extensions::types::ExtensionId;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ExtensionRuntime {
    pub installed: bool,
    pub enabled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ExtensionsFilter {
    #[default]
    All,
    Installed,
    NotInstalled,
}

pub struct ExtensionsState {
    pub extensions_query: String,
    pub extensions_filter: ExtensionsFilter,
    pub extension_runtime: HashMap<ExtensionId, ExtensionRuntime>,
}

fn default_extension_runtime() -> HashMap<ExtensionId, ExtensionRuntime> {
    let mut extension_runtime = HashMap::new();

    for id in ["core", "git"] {
        extension_runtime.insert(
            ExtensionId::new(id),
            ExtensionRuntime {
                installed: true,
                enabled: true,
            },
        );
    }

    extension_runtime
}

impl Default for ExtensionsState {
    fn default() -> Self {
        Self {
            extensions_query: String::new(),
            extensions_filter: ExtensionsFilter::All,
            extension_runtime: default_extension_runtime(),
        }
    }
}
