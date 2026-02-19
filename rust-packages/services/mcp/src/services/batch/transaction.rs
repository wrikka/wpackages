use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TransactionState {
    Active,
    Committed,
    RolledBack,
}

#[derive(Debug, Clone)]
pub struct TransactionConfig {
    pub timeout_ms: u64,
    pub auto_rollback_on_error: bool,
}

impl Default for TransactionConfig {
    fn default() -> Self {
        Self {
            timeout_ms: 30000,
            auto_rollback_on_error: true,
        }
    }
}

pub struct Transaction {
    id: String,
    state: Arc<RwLock<TransactionState>>,
    operations: Arc<RwLock<Vec<String>>>,
    config: TransactionConfig,
    rollback_operations: Arc<RwLock<Vec<String>>>,
}

impl Transaction {
    pub fn new(id: String, config: TransactionConfig) -> Self {
        Self {
            id,
            state: Arc::new(RwLock::new(TransactionState::Active)),
            operations: Arc::new(RwLock::new(Vec::new())),
            config,
            rollback_operations: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub async fn state(&self) -> TransactionState {
        *self.state.read().await
    }

    pub async fn is_active(&self) -> bool {
        self.state().await == TransactionState::Active
    }

    pub async fn add_operation(&self, operation: String) -> Result<(), String> {
        if !self.is_active().await {
            return Err("Transaction is not active".to_string());
        }

        let mut ops = self.operations.write().await;
        ops.push(operation);
        debug!("Added operation to transaction {}", self.id);

        Ok(())
    }

    pub async fn add_rollback_operation(&self, operation: String) {
        let mut rollback_ops = self.rollback_operations.write().await;
        rollback_ops.push(operation);
    }

    pub async fn commit(&self) -> Result<(), String> {
        let mut state = self.state.write().await;

        if *state != TransactionState::Active {
            return Err(format!(
                "Cannot commit transaction in state: {:?}",
                state
            ));
        }

        *state = TransactionState::Committed;
        info!("Transaction {} committed", self.id);

        Ok(())
    }

    pub async fn rollback(&self) -> Result<(), String> {
        let mut state = self.state.write().await;

        if *state != TransactionState::Active {
            return Err(format!(
                "Cannot rollback transaction in state: {:?}",
                state
            ));
        }

        *state = TransactionState::RolledBack;

        let rollback_ops = self.rollback_operations.read().await;
        for op in rollback_ops.iter() {
            warn!("Executing rollback operation: {}", op);
        }

        info!("Transaction {} rolled back", self.id);

        Ok(())
    }

    pub async fn operations(&self) -> Vec<String> {
        self.operations.read().await.clone()
    }

    pub async fn rollback_operations(&self) -> Vec<String> {
        self.rollback_operations.read().await.clone()
    }
}

impl Drop for Transaction {
    fn drop(&mut self) {
        let state = self.state.clone();
        let id = self.id.clone();
        let auto_rollback = self.config.auto_rollback_on_error;

        tokio::spawn(async move {
            if let TransactionState::Active = *state.read().await {
                if auto_rollback {
                    warn!("Transaction {} was not committed, auto-rolling back", id);
                }
            }
        });
    }
}
