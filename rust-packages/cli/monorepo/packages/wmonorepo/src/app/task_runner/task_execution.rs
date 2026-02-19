// Task execution functions

use crate::error::{AppError, AppResult};
use crate::services::cache::{calculate_workspace_hash, clean_outputs, is_cached, restore_outputs};
use crate::services::remote_cache::{
    download_remote_cache, remote_cache_exists, upload_remote_cache,
};
use crate::services::task::run_task;
use crate::types::config::TaskConfig;
use crate::types::report::{CacheSource, WorkspaceRunReport};
use crate::types::workspace::Workspace;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

use super::task_caching::{CacheResult, TaskCacheOptions};
use super::task_plugins::TaskPluginManager;
use super::task_validation::validate_task_config;

pub struct TaskExecutionOptions {
    pub dry_run: bool,
    pub explain: bool,
    pub clean: bool,
    pub strict: bool,
    pub no_cache: bool,
    pub force: bool,
}

pub async fn execute_task(
    ws: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
    workspaces_map: &HashMap<String, Workspace>,
    options: &TaskExecutionOptions,
    plugin_manager: &TaskPluginManager,
    remote_cache_url: Option<&String>,
) -> AppResult<WorkspaceRunReport> {
    validate_task_config(task_name, task_config)?;

    let started = Instant::now();

    if options.dry_run {
        return Ok(WorkspaceRunReport {
            name: ws.package_json.name.clone(),
            task: task_name.to_string(),
            hash: "".to_string(),
            cache: CacheSource::None,
            cached: true,
            duration_ms: started.elapsed().as_millis(),
        });
    }

    // Run per-workspace prerequisites first
    for dep_task in &task_config.depends_on {
        if let Some(upstream_task) = dep_task.strip_prefix('^') {
            execute_upstream_task(ws, upstream_task, workspaces_map, options, plugin_manager)?;
            continue;
        }

        execute_dependency_task(ws, dep_task, task_config, options, plugin_manager)?;
    }

    let hash = calculate_workspace_hash(ws, task_name, task_config)?;

    plugin_manager.emit_before_task(&ws.package_json.name, task_name, &hash);

    // Check local cache
    let cache_options = TaskCacheOptions {
        force: options.force,
        no_cache: options.no_cache,
        clean: options.clean,
        strict: options.strict,
    };

    if let Some(cache_result) =
        super::task_caching::check_local_cache(ws, task_name, task_config, &hash, &cache_options)
            .await?
    {
        println!("LOCAL CACHE HIT: {}", ws.package_json.name);
        if options.explain {
            println!("EXPLAIN: local cache hit (hash={})", hash);
        }

        plugin_manager.emit_cache_hit(&ws.package_json.name, task_name, &hash, "local");
        super::task_caching::restore_cache(ws, &hash).await?;
        plugin_manager.emit_after_task(&ws.package_json.name, task_name, &hash, true);

        return Ok(WorkspaceRunReport {
            name: ws.package_json.name.clone(),
            task: task_name.to_string(),
            hash,
            cache: CacheSource::Local,
            cached: true,
            duration_ms: started.elapsed().as_millis(),
        });
    }

    // Check remote cache
    if let Some(url) = remote_cache_url {
        if let Some(cache_result) = super::task_caching::check_remote_cache(
            ws,
            task_name,
            task_config,
            &hash,
            url,
            &cache_options,
        )
        .await?
        {
            println!("REMOTE CACHE HIT: {}", ws.package_json.name);
            if options.explain {
                println!("EXPLAIN: remote cache hit (hash={})", hash);
            }

            plugin_manager.emit_cache_hit(&ws.package_json.name, task_name, &hash, "remote");
            super::task_caching::restore_cache(ws, &hash).await?;
            plugin_manager.emit_after_task(&ws.package_json.name, task_name, &hash, true);

            return Ok(WorkspaceRunReport {
                name: ws.package_json.name.clone(),
                task: task_name.to_string(),
                hash,
                cache: CacheSource::Remote,
                cached: true,
                duration_ms: started.elapsed().as_millis(),
            });
        }
    }

    // Cache miss - run task
    println!("CACHE MISS: {}", ws.package_json.name);
    if options.explain {
        println!("EXPLAIN: cache miss (hash={})", hash);
    }

    plugin_manager.emit_cache_miss(&ws.package_json.name, task_name, &hash);

    super::task_caching::run_with_cache(ws, task_name, task_config, &hash, &cache_options)?;

    let success = true;
    plugin_manager.emit_after_task(&ws.package_json.name, task_name, &hash, success);

    // Upload to remote cache
    if !options.no_cache {
        if let Some(url) = remote_cache_url {
            if let Err(e) = super::task_caching::upload_to_remote_cache(&hash, url).await {
                eprintln!("Failed to upload cache for {}: {}", ws.package_json.name, e);
            }
        }
    }

    Ok(WorkspaceRunReport {
        name: ws.package_json.name.clone(),
        task: task_name.to_string(),
        hash,
        cache: CacheSource::None,
        cached: false,
        duration_ms: started.elapsed().as_millis(),
    })
}

fn workspace_dependency_names<'a>(
    ws: &Workspace,
    workspaces_map: &'a HashMap<String, Workspace>,
) -> Vec<&'a Workspace> {
    let mut deps = vec![];
    for dep_name in ws.package_json.dependencies.keys() {
        if let Some(dep_ws) = workspaces_map.get(dep_name) {
            deps.push(dep_ws);
        }
    }
    deps
}

fn execute_upstream_task(
    ws: &Workspace,
    upstream_task: &str,
    workspaces_map: &HashMap<String, Workspace>,
    options: &TaskExecutionOptions,
    plugin_manager: &TaskPluginManager,
) -> AppResult<()> {
    let upstream_config = crate::config::WmoRepoConfig::default()
        .pipeline
        .get(upstream_task)
        .cloned()
        .unwrap_or_default();

    validate_task_config(upstream_task, &upstream_config)?;

    let cache_options = TaskCacheOptions {
        force: options.force,
        no_cache: options.no_cache,
        clean: options.clean,
        strict: options.strict,
    };

    for dep_ws in workspace_dependency_names(ws, workspaces_map) {
        let dep_hash = calculate_workspace_hash(dep_ws, upstream_task, &upstream_config)?;

        if !options.force && !options.no_cache && is_cached(&dep_hash) {
            restore_outputs(dep_ws, &dep_hash)?;
        } else {
            if options.clean {
                clean_outputs(dep_ws, &upstream_config)?;
            }
            run_task(
                dep_ws,
                upstream_task,
                &upstream_config,
                &dep_hash,
                options.strict,
                false,
            )?;
        }
    }

    Ok(())
}

fn execute_dependency_task(
    ws: &Workspace,
    dep_task: &str,
    task_config: &TaskConfig,
    options: &TaskExecutionOptions,
    plugin_manager: &TaskPluginManager,
) -> AppResult<()> {
    let dep_config = crate::config::WmoRepoConfig::default()
        .pipeline
        .get(dep_task)
        .cloned()
        .unwrap_or_default();

    validate_task_config(dep_task, &dep_config)?;

    let cache_options = TaskCacheOptions {
        force: options.force,
        no_cache: options.no_cache,
        clean: options.clean,
        strict: options.strict,
    };

    let dep_hash = calculate_workspace_hash(ws, dep_task, &dep_config)?;

    if !options.force && !options.no_cache && is_cached(&dep_hash) {
        restore_outputs(ws, &dep_hash)?;
    } else {
        if options.clean {
            clean_outputs(ws, &dep_config)?;
        }
        run_task(ws, dep_task, &dep_config, &dep_hash, options.strict, false)?;
    }

    Ok(())
}
