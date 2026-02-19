#[cfg(feature = "in-memory")]
mod in_memory;

#[cfg(feature = "disk")]
mod disk;

#[cfg(feature = "redis")]
mod redis;

#[cfg(all(feature = "in-memory", feature = "disk"))]
mod layered;

#[cfg(feature = "in-memory")]
pub use in_memory::InMemoryCache;

#[cfg(feature = "disk")]
pub use disk::DiskCache;

#[cfg(feature = "redis")]
pub use redis::RedisCache;

#[cfg(all(feature = "in-memory", feature = "disk"))]
pub use layered::LayeredCache;
