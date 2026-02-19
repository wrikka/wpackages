//! Distributed task execution with leader election

use crate::error::{Result, TaskError};
use crate::executor::TaskExecutor;
use crate::store::TaskStore;
use crate::types::{Task, TaskStatus};
use etcd_client::{Client, EventType, WatchOptions};
use std::time::Duration;
use tokio::sync::RwLock;
use tracing::{error, info, warn};

/// Distributed task executor with leader election
pub struct DistributedExecutor<S: TaskStore> {
    store: S,
    executor: TaskExecutor,
    etcd_client: Client,
    node_id: String,
    leader_key: String,
    is_leader: RwLock<bool>,
    lease_ttl: i64,
}

impl<S: TaskStore> DistributedExecutor<S> {
    /// Create a new distributed executor
    pub async fn new(
        store: S,
        executor: TaskExecutor,
        etcd_endpoints: Vec<String>,
        node_id: String,
    ) -> Result<Self> {
        let etcd_client = Client::connect(etcd_endpoints, None)
            .await
            .map_err(|e| TaskError::Other(format!("Failed to connect to etcd: {}", e)))?;

        let leader_key = "/task/leader".to_string();
        let lease_ttl = 10; // 10 seconds TTL

        Ok(Self {
            store,
            executor,
            etcd_client,
            node_id,
            leader_key,
            is_leader: RwLock::new(false),
            lease_ttl,
        })
    }

    /// Start the distributed executor
    pub async fn start(&self) -> Result<()> {
        info!("Starting distributed executor for node {}", self.node_id);

        // Start leader election
        self.run_leader_election().await?;

        // Start task processing loop
        self.process_tasks().await?;

        Ok(())
    }

    /// Run leader election loop
    async fn run_leader_election(&self) -> Result<()> {
        let mut lease_keepalive = self.etcd_client.lease_keep_alive();

        // Try to become leader
        loop {
            match self.try_become_leader(&mut lease_keepalive).await {
                Ok(_) => {
                    info!("Node {} became leader", self.node_id);
                    *self.is_leader.write().await = true;

                    // Watch for leader changes
                    if let Err(e) = self.watch_leader_changes().await {
                        warn!("Leader watch error: {}, retrying...", e);
                    }

                    *self.is_leader.write().await = false;
                }
                Err(e) => {
                    warn!("Failed to become leader: {}, retrying in 5s...", e);
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            }
        }
    }

    /// Try to become leader
    async fn try_become_leader(
        &self,
        lease_keepalive: &mut etcd_client::LeaseKeepAlive,
    ) -> Result<()> {
        // Create a lease
        let lease = self
            .etcd_client
            .lease_grant(self.lease_ttl, None)
            .await
            .map_err(|e| TaskError::Other(format!("Failed to grant lease: {}", e)))?;

        // Start keeping the lease alive
        let (mut keeper, mut responses) = lease_keepalive
            .keep_alive(lease.id())
            .await
            .map_err(|e| TaskError::Other(format!("Failed to keep lease alive: {}", e)))?;

        // Try to acquire leadership
        let value = self.node_id.clone();
        let _ = self
            .etcd_client
            .put(
                self.leader_key.clone(),
                value,
                Some(etcd_client::PutOptions::new().with_lease(lease.id())),
            )
            .await
            .map_err(|e| TaskError::Other(format!("Failed to put leader key: {}", e)))?;

        // Verify we are the leader
        let resp = self
            .etcd_client
            .get(self.leader_key.clone(), None)
            .await
            .map_err(|e| TaskError::Other(format!("Failed to get leader key: {}", e)))?;

        if let Some(kv) = resp.kvs().first() {
            if kv.value() == self.node_id.as_bytes() {
                // Successfully became leader
                tokio::spawn(async move {
                    while let Some(response) = responses.next().await {
                        match response {
                            Ok(_) => continue,
                            Err(e) => {
                                error!("Lease keep-alive error: {}", e);
                                break;
                            }
                        }
                    }
                    let _ = keeper.stop().await;
                });

                return Ok(());
            }
        }

        // Not the leader, revoke lease
        let _ = self.etcd_client.lease_revoke(lease.id()).await;
        Err(TaskError::Other("Failed to acquire leadership".to_string()))
    }

    /// Watch for leader changes
    async fn watch_leader_changes(&self) -> Result<()> {
        let (mut watcher, mut stream) = self
            .etcd_client
            .watch(self.leader_key.clone(), Some(WatchOptions::new()))
            .await
            .map_err(|e| TaskError::Other(format!("Failed to watch leader key: {}", e)))?;

        while let Some(response) = stream.next().await {
            match response {
                Ok(resp) => {
                    for event in resp.events() {
                        match event.event_type() {
                            EventType::Delete => {
                                info!("Leader deleted, will try to become leader");
                                return Ok(());
                            }
                            EventType::Put => {
                                if let Some(kv) = event.kv() {
                                    let leader_id = String::from_utf8_lossy(kv.value());
                                    if leader_id != self.node_id {
                                        info!("New leader: {}", leader_id);
                                        return Ok(());
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
                Err(e) => {
                    error!("Watch error: {}", e);
                    return Err(TaskError::Other(format!("Watch error: {}", e)));
                }
            }
        }

        let _ = watcher.cancel().await;
        Ok(())
    }

    /// Process tasks (only as leader)
    async fn process_tasks(&self) -> Result<()> {
        let mut interval = tokio::time::interval(Duration::from_secs(5));

        loop {
            interval.tick().await;

            // Only process tasks if we are the leader
            if *self.is_leader.read().await {
                if let Err(e) = self.process_pending_tasks().await {
                    error!("Error processing tasks: {}", e);
                }

                if let Err(e) = self.process_scheduled_tasks().await {
                    error!("Error processing scheduled tasks: {}", e);
                }
            }
        }
    }

    /// Process pending tasks
    async fn process_pending_tasks(&self) -> Result<()> {
        let pending_tasks = self.store.list_pending_tasks().await?;

        for task in pending_tasks {
            if task.should_run(chrono::Utc::now()) {
                info!(
                    "Processing task: {} (priority: {:?})",
                    task.id, task.priority
                );

                // Execute task using the executor
                let handler = || async {
                    // This is a placeholder - actual task execution depends on your use case
                    // You should replace this with your actual task handler
                    Ok(serde_json::json!({ "status": "completed" }))
                };

                let (updated_task, result) = self.executor.execute_task(task, handler).await;

                // Update task and save result
                if let Err(e) = self.store.update_task(&updated_task).await {
                    error!("Failed to update task {}: {}", updated_task.id, e);
                    // Continue processing other tasks even if one fails
                    continue;
                }
                if let Err(e) = self.store.save_result(&result).await {
                    error!("Failed to save result for task {}: {}", result.task_id, e);
                    // Continue processing other tasks even if one fails
                    continue;
                }

                info!(
                    "Task {} completed: success={}, duration_ms={}",
                    result.task_id, result.success, result.duration_ms
                );
            }
        }

        Ok(())
    }

    /// Get current leader
    pub async fn get_leader(&self) -> Result<Option<String>> {
        let resp = self
            .etcd_client
            .get(self.leader_key.clone(), None)
            .await
            .map_err(|e| TaskError::Other(format!("Failed to get leader: {}", e)))?;

        Ok(resp
            .kvs()
            .first()
            .map(|kv| String::from_utf8_lossy(kv.value()).to_string()))
    }

    /// Check if this node is the leader
    pub async fn is_leader(&self) -> bool {
        *self.is_leader.read().await
    }

    /// Stop the distributed executor
    pub async fn stop(&self) -> Result<()> {
        info!("Stopping distributed executor for node {}", self.node_id);

        // If we are the leader, revoke leadership
        if *self.is_leader.read().await {
            let _ = self.etcd_client.delete(self.leader_key.clone(), None).await;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[cfg(feature = "distributed")]
    async fn test_distributed_executor() {
        // This test requires a running etcd instance
        // Set ETCD_ENDPOINTS environment variable to test
        let etcd_endpoints: Vec<String> = std::env::var("ETCD_ENDPOINTS")
            .unwrap_or_else(|_| "http://localhost:2379".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        // This is a placeholder test - you need to implement actual tests
        // with a real TaskStore implementation
    }
}
