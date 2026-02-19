//! Spring physics animation
//! 
//! Provides spring-based animations using physics simulation

/// Spring configuration
#[derive(Debug, Clone, Copy)]
pub struct SpringConfig {
    /// Stiffness of the spring
    pub stiffness: f32,
    /// Damping ratio
    pub damping: f32,
    /// Mass of the object
    pub mass: f32,
}

impl Default for SpringConfig {
    fn default() -> Self {
        Self {
            stiffness: 100.0,
            damping: 10.0,
            mass: 1.0,
        }
    }
}

/// Spring animation state
#[derive(Debug, Clone, Copy)]
pub struct SpringState {
    /// Current position
    pub position: f32,
    /// Current velocity
    pub velocity: f32,
    /// Target position
    pub target: f32,
}

impl Default for SpringState {
    fn default() -> Self {
        Self {
            position: 0.0,
            velocity: 0.0,
            target: 0.0,
        }
    }
}

/// Spring physics simulation
pub struct Spring {
    config: SpringConfig,
    state: SpringState,
}

impl Spring {
    /// Create a new spring
    pub fn new(config: SpringConfig) -> Self {
        Self {
            config,
            state: SpringState::default(),
        }
    }

    /// Set target position
    pub fn set_target(&mut self, target: f32) {
        self.state.target = target;
    }

    /// Update spring physics
    pub fn update(&mut self, dt: f32) {
        let displacement = self.state.position - self.state.target;
        let spring_force = -self.config.stiffness * displacement;
        let damping_force = -self.config.damping * self.state.velocity;
        let acceleration = (spring_force + damping_force) / self.config.mass;
        
        self.state.velocity += acceleration * dt;
        self.state.position += self.state.velocity * dt;
    }

    /// Get current position
    pub fn position(&self) -> f32 {
        self.state.position
    }

    /// Get current velocity
    pub fn velocity(&self) -> f32 {
        self.state.velocity
    }

    /// Check if at rest
    pub fn is_at_rest(&self, threshold: f32) -> bool {
        let displacement = (self.state.position - self.state.target).abs();
        let velocity = self.state.velocity.abs();
        displacement < threshold && velocity < threshold
    }
}

impl Default for Spring {
    fn default() -> Self {
        Self::new(SpringConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_spring() {
        let mut spring = Spring::new(SpringConfig::default());
        spring.set_target(100.0);
        
        for _ in 0..100 {
            spring.update(0.016);
        }
        
        assert!(spring.is_at_rest(0.1));
        assert!((spring.position() - 100.0).abs() < 1.0);
    }
}
