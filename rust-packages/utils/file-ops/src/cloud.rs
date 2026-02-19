//! Provides a simplified interface for interacting with cloud object stores.
//!
//! This module wraps the `object_store` crate to offer a unified API for
//! common cloud storage services like AWS S3, Google Cloud Storage, and Azure Blob Storage.
//!
//! # Example
//!
//! ```no_run
//! use file_ops::CloudStore;
//! use bytes::Bytes;
//!
//! #[tokio::main]
//! async fn main() {
//!     let store = CloudStore::new("s3://my-bucket").unwrap();
//!     store.put("path/to/object.bin", Bytes::from("hello")).await.unwrap();
//!     let data = store.get("path/to/object.bin").await.unwrap();
//!     assert_eq!(data, Bytes::from("hello"));
//! }
//! ```

use crate::error::{Error, Result};
use bytes::Bytes;
use object_store::path::Path;
use object_store::ObjectStore;
use url::Url;

/// A wrapper around the `object_store` crate for simplified cloud storage access.
///
/// It supports various cloud providers through URL schemes (e.g., `s3://`, `gs://`, `azure://`).
pub struct CloudStore {
    store: Box<dyn ObjectStore>,
}

impl CloudStore {
    /// Creates a new `CloudStore` from a URL.
    ///
    /// The URL should specify the protocol (s3, gs, az) and the bucket name.
    ///
    /// # Arguments
    ///
    /// * `url` - A URL string representing the cloud storage endpoint (e.g., `s3://my-bucket`).
    ///
    /// # Supported Schemes
    ///
    /// - `s3://<bucket>` for AWS S3
    /// - `gs://<bucket>` for Google Cloud Storage
    /// - `azure://<container>` or `az://<container>` for Azure Blob Storage
    pub fn new(url: &str) -> Result<Self> {
        let url = Url::parse(url)?;
        let (store, _) = object_store::parse_url(&url)?;
        Ok(Self { store })
    }

    /// Retrieves an object from the cloud store.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the object within the store.
    pub async fn get(&self, path: &str) -> Result<Bytes> {
        let path = Path::from(path);
        let result = self.store.get(&path).await?;
        let bytes = result.bytes().await?;
        Ok(bytes)
    }

    /// Puts an object into the cloud store.
    ///
    /// # Arguments
    ///
    /// * `path` - The path where the object will be stored.
    /// * `data` - The `Bytes` to be uploaded.
    pub async fn put(&self, path: &str, data: Bytes) -> Result<()> {
        let path = Path::from(path);
        self.store.put(&path, data.into()).await?;
        Ok(())
    }

    /// Deletes an object from the cloud store.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the object to be deleted.
    pub async fn delete(&self, path: &str) -> Result<()> {
        let path = Path::from(path);
        self.store.delete(&path).await?;
        Ok(())
    }
}

// Note: Testing this module requires actual cloud credentials or a mock setup,
// which is beyond the scope of this initial implementation.
