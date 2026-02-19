use crate::error::{AppError, AppResult};
use crate::types::{SearchDirection, SearchMatch, SearchQuery, SearchResult, SearchState};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct SearchEvent {
    pub event_type: SearchEventType,
    pub tab_id: Option<String>,
    pub query: Option<SearchQuery>,
    pub result: Option<SearchResult>,
}

#[derive(Clone, Serialize)]
pub enum SearchEventType {
    Started,
    Updated,
    Finished,
    Cleared,
}

#[derive(Clone)]
pub struct SearchService {
    states: Arc<DashMap<String, SearchState>>,
}

impl Default for SearchService {
    fn default() -> Self {
        Self::new()
    }
}

impl SearchService {
    pub fn new() -> Self {
        Self {
            states: Arc::new(DashMap::new()),
        }
    }

    pub async fn start_search<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        query: SearchQuery,
        content: &str,
    ) -> AppResult<SearchResult> {
        let mut state = SearchState::default();
        state.activate(query.clone());

        let result = self.search_content(&query, content);

        state.result = result.clone();
        self.states.insert(tab_id.clone(), state);

        self.emit_event(
            &app_handle,
            SearchEvent {
                event_type: SearchEventType::Started,
                tab_id: Some(tab_id),
                query: Some(query),
                result: Some(result),
            },
        )?;

        Ok(result)
    }

    pub async fn update_search<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        query: SearchQuery,
        content: &str,
    ) -> AppResult<SearchResult> {
        let result = self.search_content(&query, content);

        if let Some(mut state) = self.states.get_mut(&tab_id) {
            state.update_query(query.clone());
            state.result = result.clone();
        }

        self.emit_event(
            &app_handle,
            SearchEvent {
                event_type: SearchEventType::Updated,
                tab_id: Some(tab_id),
                query: Some(query),
                result: Some(result.clone()),
            },
        )?;

        Ok(result)
    }

    pub async fn next_match<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
    ) -> AppResult<Option<SearchMatch>> {
        if let Some(mut state) = self.states.get_mut(&tab_id) {
            let next = state.result.next_match();
            if next.is_some() {
                self.emit_event(
                    &app_handle,
                    SearchEvent {
                        event_type: SearchEventType::Updated,
                        tab_id: Some(tab_id),
                        query: Some(state.query.clone()),
                        result: Some(state.result.clone()),
                    },
                )?;
            }
            Ok(next.cloned())
        } else {
            Ok(None)
        }
    }

    pub async fn previous_match<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
    ) -> AppResult<Option<SearchMatch>> {
        if let Some(mut state) = self.states.get_mut(&tab_id) {
            let prev = state.result.previous_match();
            if prev.is_some() {
                self.emit_event(
                    &app_handle,
                    SearchEvent {
                        event_type: SearchEventType::Updated,
                        tab_id: Some(tab_id),
                        query: Some(state.query.clone()),
                        result: Some(state.result.clone()),
                    },
                )?;
            }
            Ok(prev.cloned())
        } else {
            Ok(None)
        }
    }

    pub async fn clear_search<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
    ) -> AppResult<()> {
        self.states.remove(&tab_id);

        self.emit_event(
            &app_handle,
            SearchEvent {
                event_type: SearchEventType::Cleared,
                tab_id: Some(tab_id),
                query: None,
                result: None,
            },
        )?;

        Ok(())
    }

    pub async fn get_search_state(&self, tab_id: &str) -> Option<SearchState> {
        self.states.get(tab_id).map(|s| s.clone())
    }

    pub async fn is_searching(&self, tab_id: &str) -> bool {
        self.states
            .get(tab_id)
            .map(|s| s.is_active)
            .unwrap_or(false)
    }

    fn search_content(&self, query: &SearchQuery, content: &str) -> SearchResult {
        let mut result = SearchResult::new(query.clone());

        if query.query.is_empty() {
            return result;
        }

        let lines: Vec<&str> = content.lines().collect();

        for (line_idx, line) in lines.iter().enumerate() {
            let matches = self.find_matches_in_line(query, line, line_idx);
            for match_ in matches {
                result.add_match(match_);
            }
        }

        result
    }

    fn find_matches_in_line(
        &self,
        query: &SearchQuery,
        line: &str,
        line_idx: usize,
    ) -> Vec<SearchMatch> {
        let mut matches = Vec::new();

        let search_text = if query.case_sensitive {
            line.to_string()
        } else {
            line.to_lowercase()
        };

        let query_text = if query.case_sensitive {
            query.query.clone()
        } else {
            query.query.to_lowercase()
        };

        let mut start = 0;
        while let Some(pos) = search_text[start..].find(&query_text) {
            let abs_pos = start + pos;
            let end = abs_pos + query.query.len();

            matches.push(SearchMatch {
                line: line_idx,
                start_col: abs_pos,
                end_col: end,
                matched_text: line[abs_pos..end].to_string(),
                context_before: if abs_pos > 20 {
                    Some(line[abs_pos - 20..abs_pos].to_string())
                } else {
                    Some(line[..abs_pos].to_string())
                },
                context_after: if end + 20 < line.len() {
                    Some(line[end..end + 20].to_string())
                } else {
                    Some(line[end..].to_string())
                },
            });

            start = end;
        }

        matches
    }

    pub async fn replace_all<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        query: SearchQuery,
        replacement: String,
        content: &str,
    ) -> AppResult<(String, usize)> {
        let result = self.search_content(&query, content);

        if result.total_matches == 0 {
            return Ok((content.to_string(), 0));
        }

        let mut new_content = content.to_string();

        // Replace from end to start to preserve positions
        for match_ in result.matches.iter().rev() {
            let lines: Vec<&str> = new_content.lines().collect();
            if let Some(line) = lines.get(match_.line) {
                let before = &line[..match_.start_col];
                let after = &line[match_.end_col..];
                let new_line = format!("{}{}{}", before, replacement, after);

                let mut new_lines: Vec<String> = lines.iter().map(|s| s.to_string()).collect();
                new_lines[match_.line] = new_line;
                new_content = new_lines.join("\n");
            }
        }

        self.emit_event(
            &app_handle,
            SearchEvent {
                event_type: SearchEventType::Finished,
                tab_id: Some(tab_id),
                query: Some(query),
                result: Some(result),
            },
        )?;

        Ok((new_content, result.total_matches))
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: SearchEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("search-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit search event: {}", e)))?;
        Ok(())
    }

    pub async fn get_all_search_states(&self) -> Vec<(String, SearchState)> {
        self.states
            .iter()
            .map(|entry| (entry.key().clone(), entry.value().clone()))
            .collect()
    }
}
