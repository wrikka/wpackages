use super::*;

impl Default for IdeState {
    fn default() -> Self {
        let channels = groups::ChannelState::new();
        Self {
            core: groups::CoreState::default(),
            features: groups::FeatureState::default(),
            services: groups::ServiceState::default(),
            channels: channels.0,
        }
    }
}
