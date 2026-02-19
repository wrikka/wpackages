use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Challenge {
    id: String,
    title: String,
    description: String,
    completed: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Achievement {
    id: String,
    title: String,
    unlocked: bool,
}

pub struct GamifiedLearningService {
    challenges: Vec<Challenge>,
    achievements: Vec<Achievement>,
    user_points: u64,
}

impl Default for GamifiedLearningService {
    fn default() -> Self {
        Self::new()
    }
}

impl GamifiedLearningService {
    pub fn new() -> Self {
        // Load challenges and achievements from a config file in a real app
        Self {
            challenges: vec![Challenge {
                id: "first_command".to_string(),
                title: "First Command".to_string(),
                description: "Run your first command in the integrated terminal.".to_string(),
                completed: false,
            }],
            achievements: vec![],
            user_points: 0,
        }
    }

    pub fn complete_challenge(&mut self, id: &str) {
        if let Some(challenge) = self.challenges.iter_mut().find(|c| c.id == id) {
            if !challenge.completed {
                challenge.completed = true;
                self.user_points += 10; // Award points
                                        // Check if any achievement is unlocked
            }
        }
    }

    pub fn get_challenges(&self) -> &[Challenge] {
        &self.challenges
    }
}
