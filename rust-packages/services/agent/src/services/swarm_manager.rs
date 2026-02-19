//! services/swarm_manager.rs

use crate::types::swarm::SwarmMessage;
use redis::{AsyncCommands, Client as RedisClient};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Manages inter-agent communication for a distributed swarm using Redis.
#[derive(Clone)]
pub struct SwarmManager {
    redis_client: Arc<RedisClient>,
}

impl SwarmManager {
    /// Creates a new `SwarmManager` connected to the given Redis URL.
    pub fn new(redis_url: &str) -> redis::RedisResult<Self> {
        let client = RedisClient::open(redis_url)?;
        Ok(Self { redis_client: Arc::new(client) })
    }

    /// Sends a message to another agent in the swarm via a Redis channel.
    pub async fn send_message(&self, message: &SwarmMessage) -> redis::RedisResult<()> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let channel = format!("agent:{}", message.target_agent_id);
        let payload = serde_json::to_string(message).unwrap();
        conn.publish(channel, payload).await?;
        Ok(())
    }

    // A method to listen for messages would also be implemented here,
    // likely returning a stream of SwarmMessages.
}
