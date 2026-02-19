use thiserror::Error;

use crate::protocol::{
    Action, Command, IndexBuildParams, IndexBuildResult, IndexSemanticParams, IndexSemanticResult, 
    IndexStatsResult, IndexWatchParams, IndexWatchResult, LspDefinitionParams, LspDefinitionResult,
    LspReferencesParams, LspReferencesResult, LspSymbolsParams, LspSymbolsResult, QueryParams, 
    QueryResult, Response, SearchSemanticParams, SearchSemanticResult, SearchSymbolParams, 
    SearchSymbolResult, SearchSyntaxParams, SearchSyntaxResult, SearchTextParams, SearchTextResult,
};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use std::sync::Arc;
use crate::index::{InMemoryIndex, SearchIndex};

pub struct ServerState {
    pub index: Option<Arc<InMemoryIndex>>,
    pub watching: bool,
}

impl Default for ServerState {
    fn default() -> Self {
        Self {
            index: None,
            watching: false,
        }
    }
}

pub async fn run(bind: &str) -> Result<(), ServerError> {
    let listener = TcpListener::bind(bind).await?;
    let state = Arc::new(std::sync::RwLock::new(ServerState::default()));

    loop {
        let (socket, _) = listener.accept().await?;
        let state = state.clone();
        tokio::spawn(async move {
            if let Err(e) = handle_client(socket, state).await {
                eprintln!("Error handling client: {}", e);
            }
        });
    }
}

#[derive(Error, Debug)]
enum ServerError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON serialization/deserialization error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Text search error: {0}")]
    TextSearch(#[from] crate::engine::text::TextSearchError),
    #[error("Syntax search error: {0}")]
    SyntaxSearch(#[from] crate::engine::syntax::SyntaxSearchError),
    #[error("Symbol search error: {0}")]
    SymbolSearch(#[from] crate::engine::symbol::SymbolSearchError),
    #[error("Semantic search error: {0}")]
    SemanticSearch(#[from] crate::engine::semantic::SemanticError),
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),
    #[error("Query parse error: {0}")]
    QueryParse(String),
    #[error("Query execution error: {0}")]
    QueryExecution(String),
    #[error("Index error: {0}")]
    Index(String),
    #[error("LSP error: {0}")]
    Lsp(String),
}

async fn handle_client(socket: TcpStream, state: Arc<std::sync::RwLock<ServerState>>) -> Result<(), ServerError> {
    let (read_half, mut write_half) = socket.into_split();
    let mut reader = BufReader::new(read_half).lines();

    while let Some(line) = reader.next_line().await? {
        let cmd: Command = match serde_json::from_str(&line) {
            Ok(c) => c,
            Err(e) => {
                let resp = Response {
                    id: "".to_string(),
                    success: false,
                    data: None,
                    error: Some(format!("invalid command: {}", e)),
                };
                let out = serde_json::to_string(&resp)?;
                write_half.write_all(out.as_bytes()).await?;
                write_half.write_all(b"\n").await?;
                continue;
            }
        };

        let id = cmd.id.clone();
        let resp = match handle_request(cmd, state.clone()).await {
            Ok(data) => Response {
                id,
                success: true,
                data: Some(data),
                error: None,
            },
            Err(e) => Response {
                id,
                success: false,
                data: None,
                error: Some(e.to_string()),
            },
        };

        let out = serde_json::to_string(&resp)?;
        write_half.write_all(out.as_bytes()).await?;
        write_half.write_all(b"\n").await?;
    }

    Ok(())
}

async fn handle_request(cmd: Command, state: Arc<std::sync::RwLock<ServerState>>) -> Result<serde_json::Value, ServerError> {
    match cmd.action {
        Action::SearchText => {
            let params: SearchTextParams = serde_json::from_value(cmd.params)?;
            let matches = crate::engine::text::search(&params.root, &params.pattern, params.regex, params.limit)?;
            Ok(serde_json::to_value(SearchTextResult { matches })?)
        }
        Action::SearchSyntax => {
            let params: SearchSyntaxParams = serde_json::from_value(cmd.params)?;
            let matches = crate::engine::syntax::search(&params.root, &params.query, params.language.as_deref(), params.limit)?;
            Ok(serde_json::to_value(SearchSyntaxResult { matches })?)
        }
        Action::SearchSymbol => {
            let params: SearchSymbolParams = serde_json::from_value(cmd.params)?;
            let matches = crate::engine::symbol::search(&params.root, &params.query, params.limit)?;
            Ok(serde_json::to_value(SearchSymbolResult { matches })?)
        }
        Action::SearchSemantic => {
            let params: SearchSemanticParams = serde_json::from_value(cmd.params)?;
            let config = crate::config::load()?;
            let matches = crate::engine::semantic::search(&params.root, &params.query, params.limit, &config).await?;
            Ok(serde_json::to_value(SearchSemanticResult { matches })?)
        }
        Action::IndexSemantic => {
            Ok(serde_json::Value::Null)
        }
        Action::Query => {
            let params: QueryParams = serde_json::from_value(cmd.params)?;
            let config = crate::config::load()?;
            let query = crate::query::parser::parse_query(&params.query)
                .map_err(|e| ServerError::QueryParse(e.to_string()))?;
            let executor = crate::query::executor::QueryExecutor::new(&params.root, config);
            let matches = executor.execute(&query).await
                .map_err(|e| ServerError::QueryExecution(e.to_string()))?;
            Ok(serde_json::to_value(QueryResult { matches })?)
        }
        Action::IndexBuild => {
            let params: IndexBuildParams = serde_json::from_value(cmd.params)?;
            let start = std::time::Instant::now();
            
            let index = Arc::new(InMemoryIndex::new(std::path::PathBuf::from(&params.root)));
            let watcher = crate::index::watcher::IndexWatcher::new(
                std::path::PathBuf::from(&params.root),
                index.clone(),
            ).map_err(|e| ServerError::Index(e.to_string()))?;
            
            let indexed_files = watcher.initial_index().await
                .map_err(|e| ServerError::Index(e.to_string()))?;
            
            {
                let mut state_guard = state.write().unwrap();
                state_guard.index = Some(index);
                state_guard.watching = params.watch.unwrap_or(true);
            }
            
            Ok(serde_json::to_value(IndexBuildResult {
                indexed_files,
                duration_ms: start.elapsed().as_millis() as u64,
            })?)
        }
        Action::IndexStats => {
            let state_guard = state.read().unwrap();
            let stats = if let Some(index) = &state_guard.index {
                let s = index.stats();
                IndexStatsResult {
                    total_files: s.total_files,
                    total_symbols: s.total_symbols,
                    total_size: s.total_size,
                    last_updated: s.last_updated,
                    watching: state_guard.watching,
                }
            } else {
                IndexStatsResult {
                    total_files: 0,
                    total_symbols: 0,
                    total_size: 0,
                    last_updated: 0,
                    watching: false,
                }
            };
            Ok(serde_json::to_value(stats)?)
        }
        Action::IndexWatch => {
            let params: IndexWatchParams = serde_json::from_value(cmd.params)?;
            let mut state_guard = state.write().unwrap();
            state_guard.watching = params.enable;
            Ok(serde_json::to_value(IndexWatchResult { watching: params.enable })?)
        }
        Action::LspDefinition => {
            let _params: LspDefinitionParams = serde_json::from_value(cmd.params)?;
            Ok(serde_json::to_value(LspDefinitionResult { definition: None })?)
        }
        Action::LspReferences => {
            let _params: LspReferencesParams = serde_json::from_value(cmd.params)?;
            Ok(serde_json::to_value(LspReferencesResult { references: vec![] })?)
        }
        Action::LspSymbols => {
            let _params: LspSymbolsParams = serde_json::from_value(cmd.params)?;
            Ok(serde_json::to_value(LspSymbolsResult { symbols: vec![] })?)
        }
    }
}
