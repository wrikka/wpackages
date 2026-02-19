// Task caching functions

use crate::error::AppResult;
use crate::services::cache::{calculate_workspace_hash, clean_outputs, is_cached, restore_outputs};
use crate::services::remote_cache::{
    download_remote_cache, remote_cache_exists, upload_remote_cache,
};
use crate::services::task::run_task;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;

pub struct TaskCacheOptions {
    pub force: bool,
    pub no_cache: bool,
    pub clean: bool,
    pub strict: bool,
}

pub async fn check_local_cache(
    ws: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
    hash: &str,
    options: &TaskCacheOptions,
) -> AppResult<Option<CacheResult>> {
    if !options.force && !options.no_cache && is_cached(hash) {
        return Ok(Some(CacheResult {
            source: CacheSource::Local,
            hash: hash.to_string(),
        }));
    }
    Ok(None)
}

pub async fn check_remote_cache(
    ws: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
    hash: &str,
    remote_cache_url: &str,
    options: &TaskCacheOptions,
) -> AppResult<Option<CacheResult>> {
    if !options.no_cache {
        if remote_cache_exists(hash, remote_cache_url).await? {
            if download_remote_cache(hash, remote_cache_url).await.is_ok() {
                return Ok(Some(CacheResult {
                    source: CacheSource::Remote,
                    hash: hash.to_string(),
                }));
            }
        }
    }
    Ok(None)
}

pub async fn restore_cache(ws: &Workspace, hash: &str) -> AppResult<()> {
    restore_outputs(ws, hash)
}

pub async fn upload_to_remote_cache(hash: &str, remote_cache_url: &str) -> AppResult<()> {
    upload_remote_cache(hash, remote_cache_url).await
}

pub fn run_with_cache(
    ws: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
    hash: &str,
    options: &TaskCacheOptions,
) -> AppResult<()> {
    if options.clean {
        clean_outputs(ws, task_config)?;
    }
    run_task(
        ws,
        task_name,
        task_config,
        hash,
        options.strict,
        options.no_cache,
    )
}

#[derive(Debug, Clone)]
pub struct CacheResult {
    pub source: CacheSource,
    pub hash: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CacheSource {
    Local,
    Remote,
}
