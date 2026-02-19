//! Provides helper functions for serializing and deserializing data to/from files.
//!
//! This module supports JSON and TOML formats using the `serde` framework.

use crate::error::{Error, Result};
use camino::Utf8Path;
use serde::{de::DeserializeOwned, Serialize};
use std::fs;

/// Reads and deserializes a JSON file into a specified type.
///
/// # Type Parameters
///
/// * `T` - The type to deserialize the JSON into. Must implement `DeserializeOwned`.
///
/// # Arguments
///
/// * `path` - The path to the JSON file.
///
/// # Example
///
/// ```no_run
/// use file_ops::read_json;
/// use camino::Utf8Path;
/// use serde::Deserialize;
///
/// #[derive(Deserialize)]
/// struct Config { version: String }
///
/// let path = Utf8Path::new("config.json");
/// let config: Config = read_json(path).unwrap();
/// ```
pub fn read_json<T: DeserializeOwned>(path: &Utf8Path) -> Result<T> {
    let content = fs::read_to_string(path)?;
    serde_json::from_str(&content).map_err(Into::into)
}

/// Serializes data and writes it to a JSON file.
///
/// The JSON output is pretty-printed.
///
/// # Type Parameters
///
/// * `T` - The type of the data to serialize. Must implement `Serialize`.
///
/// # Arguments
///
/// * `path` - The path to write the JSON file to.
/// * `data` - The data to serialize.
pub fn write_json<T: Serialize>(path: &Utf8Path, data: &T) -> Result<()> {
    let content = serde_json::to_string_pretty(data)?;
    fs::write(path, content)?;
    Ok(())
}

/// Reads and deserializes a TOML file into a specified type.
///
/// # Type Parameters
///
/// * `T` - The type to deserialize the TOML into. Must implement `DeserializeOwned`.
///
/// # Arguments
///
/// * `path` - The path to the TOML file.
pub fn read_toml<T: DeserializeOwned>(path: &Utf8Path) -> Result<T> {
    let content = fs::read_to_string(path)?;
    toml::from_str(&content).map_err(Into::into)
}

/// Serializes data and writes it to a TOML file.
///
/// # Type Parameters
///
/// * `T` - The type of the data to serialize. Must implement `Serialize`.
///
/// # Arguments
///
/// * `path` - The path to write the TOML file to.
/// * `data` - The data to serialize.
pub fn write_toml<T: Serialize>(path: &Utf8Path, data: &T) -> Result<()> {
    let content = toml::to_string(data)?;
    fs::write(path, content)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};
    use tempfile::tempdir;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestData {
        name: String,
        value: u32,
    }

    #[test]
    fn test_json_roundtrip() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.json");

        let data = TestData { name: "test".to_string(), value: 42 };

        write_json(&file_path, &data)?;
        let read_data: TestData = read_json(&file_path)?;

        assert_eq!(data, read_data);

        Ok(())
    }

    #[test]
    fn test_toml_roundtrip() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.toml");

        let data = TestData { name: "test".to_string(), value: 42 };

        write_toml(&file_path, &data)?;
        let read_data: TestData = read_toml(&file_path)?;

        assert_eq!(data, read_data);

        Ok(())
    }
}
