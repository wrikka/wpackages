#[derive(Debug, Clone, Default)]
pub struct ProfilerClient {
    pub sessions: Vec<Profile>,
}

impl ProfilerClient {
    pub fn new() -> Self {
        Self {
            sessions: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub duration: std::time::Duration,
    pub samples: Vec<Sample>,
}

impl Profile {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            timestamp: chrono::Utc::now(),
            duration: std::time::Duration::ZERO,
            samples: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Sample {
    pub timestamp: std::time::Duration,
    pub function_name: String,
    pub line: usize,
}
