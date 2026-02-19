//! Defines types for progress reporting during file operations.
//!
//! # Example
//!
//! ```
//! use file_ops::{Progress, ProgressCallback};
//!
//! let callback: ProgressCallback = Box::new(|progress| {
//!     println!("Progress: {}%", (progress.transferred_bytes * 100) / progress.total_bytes);
//! });
//! 
//! // Simulate a progress update
//! callback(Progress { total_bytes: 1024, transferred_bytes: 512 });
//! ```

/// Represents the progress of a file operation.
#[derive(Debug, Clone, Copy)]
pub struct Progress {
    /// The total number of bytes to be transferred.
    pub total_bytes: u64,
    /// The number of bytes that have been transferred so far.
    pub transferred_bytes: u64,
}

/// A callback function for reporting progress.
///
/// This is a type alias for a boxed, thread-safe closure that takes a `Progress` struct.
pub type ProgressCallback<'a> = Box<dyn Fn(Progress) + Send + Sync + 'a>;
