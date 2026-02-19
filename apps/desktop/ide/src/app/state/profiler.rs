use crate::types::profiling::{Profile, ProfilerClient};

#[derive(Debug, Clone, Default)]
pub struct ProfilerState {
    pub client: ProfilerClient,
    pub current_profile: Option<Profile>,
    pub profiling: bool,
    pub profiles: Vec<Profile>,
}

impl ProfilerState {
    pub fn new() -> Self {
        Self {
            client: ProfilerClient::new(),
            current_profile: None,
            profiling: false,
            profiles: Vec::new(),
        }
    }

    pub fn with_client(mut self, client: ProfilerClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_current_profile(mut self, profile: Profile) -> Self {
        self.current_profile = Some(profile);
        self
    }

    pub fn with_profiling(mut self, profiling: bool) -> Self {
        self.profiling = profiling;
        self
    }

    pub fn with_profiles(mut self, profiles: Vec<Profile>) -> Self {
        self.profiles = profiles;
        self
    }

    pub fn set_current_profile(&mut self, profile: Profile) {
        self.current_profile = Some(profile);
    }

    pub fn set_profiling(&mut self, profiling: bool) {
        self.profiling = profiling;
    }

    pub fn add_profile(&mut self, profile: Profile) {
        self.profiles.push(profile);
    }

    pub fn is_profiling(&self) -> bool {
        self.profiling
    }

    pub fn profile_count(&self) -> usize {
        self.profiles.len()
    }

    pub fn get_profile(&self, id: &str) -> Option<&Profile> {
        self.profiles.iter().find(|p| p.id == id)
    }

    pub fn get_latest_profile(&self) -> Option<&Profile> {
        self.profiles.last()
    }
}
