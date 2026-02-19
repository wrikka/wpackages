//! Extension Service
//!
//! Business logic สำหรับการจัดการ extensions

use crate::adapters::extension_repository::ExtensionRepository;
use crate::error::{ApiError, ApiResult};
use crate::types::models::{
    CreateExtensionRequest, Extension, ExtensionSearchResult, ExtensionUpdate,
    UpdateExtensionRequest,
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct ExtensionService {
    repository: ExtensionRepository,
}

impl ExtensionService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: ExtensionRepository::new(pool),
        }
    }

    pub async fn search(
        &self,
        query: Option<String>,
        category: Option<String>,
        limit: usize,
        offset: usize,
    ) -> ApiResult<Vec<ExtensionSearchResult>> {
        self.repository
            .search(query, category, limit, offset)
            .await
            .map_err(|e| ApiError::Database(e))
    }

    pub async fn get_by_id(&self, id: Uuid) -> ApiResult<Extension> {
        self.repository
            .find_by_id(id)
            .await
            .map_err(|e| ApiError::Database(e))?
            .ok_or_else(|| ApiError::not_found("Extension", id.to_string()))
    }

    pub async fn create(&self, req: CreateExtensionRequest) -> ApiResult<Extension> {
        self.repository
            .create(req)
            .await
            .map_err(|e| ApiError::Database(e))
    }

    pub async fn update(&self, id: Uuid, req: UpdateExtensionRequest) -> ApiResult<Extension> {
        self.repository
            .update(id, req)
            .await
            .map_err(|e| ApiError::Database(e))?
            .ok_or_else(|| ApiError::not_found("Extension", id.to_string()))
    }

    pub async fn delete(&self, id: Uuid) -> ApiResult<()> {
        let deleted = self
            .repository
            .delete(id)
            .await
            .map_err(|e| ApiError::Database(e))?;
        if !deleted {
            return Err(ApiError::not_found("Extension", id.to_string()));
        }
        Ok(())
    }

    pub async fn increment_downloads(&self, id: Uuid) -> ApiResult<()> {
        let updated = self
            .repository
            .increment_downloads(id)
            .await
            .map_err(|e| ApiError::Database(e))?;
        if !updated {
            return Err(ApiError::not_found("Extension", id.to_string()));
        }
        Ok(())
    }

    pub async fn check_updates(&self, extension_id: Uuid) -> ApiResult<Option<ExtensionUpdate>> {
        self.repository
            .check_updates(extension_id)
            .await
            .map_err(|e| ApiError::Database(e))
    }
}
