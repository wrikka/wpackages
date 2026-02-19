pub mod browser_adapter;
pub mod cache_adapter;
pub mod embeddings_adapter;

pub use browser_adapter::{AgentBrowserAdapter, BrowserAdapter};
pub use cache_adapter::{CacheAdapter, RealCacheAdapter};
pub use embeddings_adapter::{EmbeddingsAdapter, RealEmbeddingsAdapter};
