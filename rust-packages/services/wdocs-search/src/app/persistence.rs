use crate::components::inverted_index::InvertedIndex;
use crate::types::document::{DocId, Document};
use crate::types::search_options::IndexStats;
use rustc_hash::FxHashMap;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{Read, Write};
use std::path::Path;

/// Version for persistence format
const PERSISTENCE_VERSION: u32 = 1;

#[derive(Serialize, Deserialize)]
pub struct IndexData {
    version: u32,
    docs: FxHashMap<DocId, Document>,
    next_doc_id: DocId,
    metadata: IndexMetadata,
}

#[derive(Serialize, Deserialize)]
pub struct IndexMetadata {
    created_at: u64,
    updated_at: u64,
    total_documents: usize,
    total_terms: usize,
    memory_usage_bytes: usize,
}

pub struct PersistenceManager;

impl PersistenceManager {
    /// Save index to file with compression
    pub fn save_index(
        docs: &FxHashMap<DocId, Document>,
        next_doc_id: DocId,
        inverted_index: &InvertedIndex,
        file_path: &Path,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let metadata = IndexMetadata {
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs(),
            updated_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs(),
            total_documents: docs.len(),
            total_terms: Self::estimate_total_terms(inverted_index),
            memory_usage_bytes: Self::estimate_memory_usage(docs, inverted_index),
        };

        let index_data = IndexData {
            version: PERSISTENCE_VERSION,
            docs: docs.clone(),
            next_doc_id,
            metadata,
        };

        // Serialize to JSON with pretty printing
        let json_data = serde_json::to_string_pretty(&index_data)?;

        // Write to file
        let mut file = fs::File::create(file_path)?;
        file.write_all(json_data.as_bytes())?;

        Ok(())
    }

    /// Load index from file
    pub fn load_index(
        file_path: &Path,
    ) -> Result<(FxHashMap<DocId, Document>, DocId, IndexMetadata), Box<dyn std::error::Error>>
    {
        let mut file = fs::File::open(file_path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        let index_data: IndexData = serde_json::from_str(&contents)?;

        // Check version compatibility
        if index_data.version != PERSISTENCE_VERSION {
            return Err(format!(
                "Version mismatch: expected {}, got {}",
                PERSISTENCE_VERSION, index_data.version
            )
            .into());
        }

        Ok((index_data.docs, index_data.next_doc_id, index_data.metadata))
    }

    /// Save index in binary format for better performance
    pub fn save_index_binary(
        docs: &FxHashMap<DocId, Document>,
        next_doc_id: DocId,
        inverted_index: &InvertedIndex,
        file_path: &Path,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let metadata = IndexMetadata {
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs(),
            updated_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs(),
            total_documents: docs.len(),
            total_terms: Self::estimate_total_terms(inverted_index),
            memory_usage_bytes: Self::estimate_memory_usage(docs, inverted_index),
        };

        let index_data = IndexData {
            version: PERSISTENCE_VERSION,
            docs: docs.clone(),
            next_doc_id,
            metadata,
        };

        // Serialize to binary
        let binary_data = bincode::serialize(&index_data)?;

        // Write to file
        let mut file = fs::File::create(file_path)?;
        file.write_all(&binary_data)?;

        Ok(())
    }

    /// Load index from binary format
    pub fn load_index_binary(
        file_path: &Path,
    ) -> Result<(FxHashMap<DocId, Document>, DocId, IndexMetadata), Box<dyn std::error::Error>>
    {
        let mut file = fs::File::open(file_path)?;
        let mut contents = Vec::new();
        file.read_to_end(&mut contents)?;

        let index_data: IndexData = bincode::deserialize(&contents)?;

        // Check version compatibility
        if index_data.version != PERSISTENCE_VERSION {
            return Err(format!(
                "Version mismatch: expected {}, got {}",
                PERSISTENCE_VERSION, index_data.version
            )
            .into());
        }

        Ok((index_data.docs, index_data.next_doc_id, index_data.metadata))
    }

    /// Export index to CSV format
    pub fn export_to_csv(
        docs: &FxHashMap<DocId, Document>,
        file_path: &Path,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut file = fs::File::create(file_path)?;

        // Write CSV header
        writeln!(file, "id,title,content,metadata")?;

        // Write documents
        for (doc_id, doc) in docs {
            let title = doc.fields.get("title").unwrap_or(&String::new());
            let content = doc.fields.get("content").unwrap_or(&String::new());
            let metadata = serde_json::to_string(&doc.metadata)?;

            writeln!(
                file,
                "{},{},{},{}",
                doc_id,
                Self::escape_csv(title),
                Self::escape_csv(content),
                Self::escape_csv(&metadata)
            )?;
        }

        Ok(())
    }

    /// Import index from CSV format
    pub fn import_from_csv(
        file_path: &Path,
    ) -> Result<FxHashMap<DocId, Document>, Box<dyn std::error::Error>> {
        let mut file = fs::File::open(file_path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        let mut docs = FxHashMap::default();
        let mut lines = contents.lines();

        // Skip header
        lines.next();

        for (line_num, line) in lines.enumerate() {
            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() < 4 {
                continue;
            }

            let doc_id: DocId = parts[0]
                .parse()
                .map_err(|_| format!("Invalid doc_id at line {}", line_num + 2))?;

            let title = Self::unescape_csv(parts[1]);
            let content = Self::unescape_csv(parts[2]);
            let metadata_str = Self::unescape_csv(parts[3]);

            let metadata: serde_json::Value = serde_json::from_str(&metadata_str)
                .map_err(|_| format!("Invalid metadata at line {}", line_num + 2))?;

            let mut fields = std::collections::HashMap::new();
            fields.insert("title".to_string(), title);
            fields.insert("content".to_string(), content);

            let doc = Document {
                id: doc_id,
                fields,
                metadata,
            };

            docs.insert(doc_id, doc);
        }

        Ok(docs)
    }

    /// Create backup of index
    pub fn create_backup(
        docs: &FxHashMap<DocId, Document>,
        next_doc_id: DocId,
        inverted_index: &InvertedIndex,
        backup_dir: &Path,
    ) -> Result<String, Box<dyn std::error::Error>> {
        fs::create_dir_all(backup_dir)?;

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs();

        let backup_file = backup_dir.join(format!("index_backup_{}.json", timestamp));

        Self::save_index(docs, next_doc_id, inverted_index, &backup_file)?;

        Ok(backup_file.to_string_lossy().to_string())
    }

    /// Restore from backup
    pub fn restore_from_backup(
        backup_file: &Path,
    ) -> Result<(FxHashMap<DocId, Document>, DocId, IndexMetadata), Box<dyn std::error::Error>>
    {
        Self::load_index(backup_file)
    }

    /// Estimate total number of terms in index
    fn estimate_total_terms(inverted_index: &InvertedIndex) -> usize {
        // This is a rough estimate - in practice you'd count actual terms
        inverted_index.postings_lists.len()
    }

    /// Estimate memory usage in bytes
    fn estimate_memory_usage(
        docs: &FxHashMap<DocId, Document>,
        inverted_index: &InvertedIndex,
    ) -> usize {
        let docs_size = std::mem::size_of::<FxHashMap<DocId, Document>>()
            + docs.len() * std::mem::size_of::<Document>();

        let index_size = std::mem::size_of::<InvertedIndex>()
            + inverted_index.postings_lists.len() * std::mem::size_of::<roaring::RoaringBitmap>();

        docs_size + index_size
    }

    /// Escape CSV field
    fn escape_csv(field: &str) -> String {
        if field.contains(',') || field.contains('"') || field.contains('\n') {
            format!("\"{}\"", field.replace('"', "\"\""))
        } else {
            field.to_string()
        }
    }

    /// Unescape CSV field
    fn unescape_csv(field: &str) -> String {
        if field.starts_with('"') && field.ends_with('"') {
            field[1..field.len() - 1].replace("\"\"", "\"")
        } else {
            field.to_string()
        }
    }

    /// Validate index file integrity
    pub fn validate_index(file_path: &Path) -> Result<bool, Box<dyn std::error::Error>> {
        let metadata = fs::metadata(file_path)?;

        // Check if file is not empty
        if metadata.len() == 0 {
            return Ok(false);
        }

        // Try to load and validate
        match Self::load_index(file_path) {
            Ok((docs, _, _)) => {
                // Basic validation: check if we have documents
                Ok(!docs.is_empty())
            }
            Err(_) => Ok(false),
        }
    }

    /// Get index statistics from file
    pub fn get_index_stats(file_path: &Path) -> Result<IndexStats, Box<dyn std::error::Error>> {
        let (_, _, metadata) = Self::load_index(file_path)?;

        Ok(IndexStats {
            document_count: metadata.total_documents as u32,
            term_count: metadata.total_terms as u32,
            memory_usage_bytes: metadata.memory_usage_bytes as u64,
            created_at: metadata.created_at,
            updated_at: metadata.updated_at,
        })
    }
}
