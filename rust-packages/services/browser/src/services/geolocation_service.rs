use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Geolocation {
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: Option<f64>,
}

impl Geolocation {
    pub fn new(latitude: f64, longitude: f64) -> Self {
        Self {
            latitude,
            longitude,
            accuracy: Some(100.0),
        }
    }

    pub fn with_accuracy(mut self, accuracy: f64) -> Self {
        self.accuracy = Some(accuracy);
        self
    }
}

#[async_trait]
pub trait GeolocationService: Send + Sync {
    async fn set(&self, session_id: &str, geolocation: &Geolocation) -> Result<()>;
    async fn get(&self, session_id: &str) -> Result<Option<Geolocation>>;
    async fn clear(&self, session_id: &str) -> Result<()>;
}

pub struct MockGeolocationService {
    locations: RwLock<HashMap<String, Geolocation>>,
}

impl MockGeolocationService {
    pub fn new() -> Self {
        Self {
            locations: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for MockGeolocationService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl GeolocationService for MockGeolocationService {
    async fn set(&self, session_id: &str, geolocation: &Geolocation) -> Result<()> {
        self.locations
            .write()
            .unwrap()
            .insert(session_id.to_string(), geolocation.clone());
        Ok(())
    }

    async fn get(&self, session_id: &str) -> Result<Option<Geolocation>> {
        Ok(self.locations.read().unwrap().get(session_id).cloned())
    }

    async fn clear(&self, session_id: &str) -> Result<()> {
        self.locations.write().unwrap().remove(session_id);
        Ok(())
    }
}
