use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub action: Action,
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub id: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Action {
    SearchText,
    SearchSyntax,
    SearchSymbol,
    SearchSemantic,
    IndexSemantic,
    Query,
    IndexBuild,
    IndexStats,
    IndexWatch,
    LspDefinition,
    LspReferences,
    LspSymbols,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchTextParams {
    pub root: String,
    pub pattern: String,
    pub regex: bool,
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchTextResult {
    pub matches: Vec<crate::engine::text::TextMatch>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSyntaxParams {
    pub root: String,
    pub query: String,
    pub language: Option<String>,
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSyntaxResult {
    pub matches: Vec<crate::engine::syntax::SyntaxMatch>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSymbolParams {
    pub root: String,
    pub query: String,
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSymbolResult {
    pub matches: Vec<crate::engine::symbol::Symbol>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSemanticParams {
    pub root: String,
    pub query: String,
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSemanticResult {
    pub matches: Vec<crate::engine::semantic::SemanticMatch>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexSemanticParams {
    pub root: String,
    pub max_files: Option<usize>,
    pub max_chunks: Option<usize>,
    pub max_lines_per_chunk: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexSemanticResult {
    pub indexed_chunks: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryParams {
    pub root: String,
    pub query: String,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub matches: Vec<crate::query::executor::SearchResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexBuildParams {
    pub root: String,
    pub watch: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexBuildResult {
    pub indexed_files: usize,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStatsResult {
    pub total_files: usize,
    pub total_symbols: usize,
    pub total_size: u64,
    pub last_updated: u64,
    pub watching: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexWatchParams {
    pub root: String,
    pub enable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexWatchResult {
    pub watching: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspDefinitionParams {
    pub root: String,
    pub uri: String,
    pub line: u32,
    pub character: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspDefinitionResult {
    pub definition: Option<crate::engine::lsp::LspDefinition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspReferencesParams {
    pub root: String,
    pub uri: String,
    pub line: u32,
    pub character: u32,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspReferencesResult {
    pub references: Vec<crate::engine::lsp::LspReference>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspSymbolsParams {
    pub root: String,
    pub query: String,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspSymbolsResult {
    pub symbols: Vec<crate::engine::lsp::LspSymbol>,
}
