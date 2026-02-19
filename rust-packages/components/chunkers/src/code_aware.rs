use crate::error::{ChunkingError, ChunkingResult};
use crate::types::{Chunk, ChunkMetadata, ChunkingConfig, ChunkOutput, ChunkingStrategy, Chunker};
use regex::Regex;

pub struct CodeAwareChunker {
    config: ChunkingConfig,
    language: String,
}

impl CodeAwareChunker {
    pub fn new(config: ChunkingConfig, language: impl Into<String>) -> Self {
        Self {
            config,
            language: language.into(),
        }
    }

    fn chunk_rust(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(code, r"fn\s+\w+|impl\s+\w+|struct\s+\w+|mod\s+\w+")
    }

    fn chunk_python(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(code, r"def\s+\w+|class\s+\w+")
    }

    fn chunk_javascript(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(code, r"function\s+\w+|class\s+\w+|const\s+\w+\s*=")
    }

    fn chunk_java(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(
            code,
            r"public\s+(static\s+)?\w+\s+\w+|class\s+\w+|interface\s+\w+",
        )
    }

    fn chunk_go(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(code, r"func\s+\w+|type\s+\w+|struct\s+\w+")
    }

    fn chunk_cpp(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_functions(code, r"\w+\s+\w+\s*\(|class\s+\w+|struct\s+\w+")
    }

    fn chunk_generic(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        self.chunk_by_size(code)
    }

    fn chunk_by_functions(&self, code: &str, pattern: &str) -> ChunkingResult<Vec<Chunk>> {
        let re = Regex::new(pattern)
            .map_err(|e| ChunkingError::CodeAware(format!("Invalid regex: {}", e)))?;

        let mut chunks = Vec::new();
        let mut start = 0;
        let mut last_match = 0;

        for mat in re.find_iter(code) {
            let end = mat.start();
            if end > start {
                let chunk_text = &code[start..end];
                if chunk_text.trim().len() >= self.config.min_chunk_size {
                    chunks.push(self.create_chunk(chunk_text, start)?);
                }
            }
            start = end;
            last_match = end;
        }

        if last_match < code.len() {
            let chunk_text = &code[last_match..];
            if chunk_text.trim().len() >= self.config.min_chunk_size {
                chunks.push(self.create_chunk(chunk_text, last_match)?);
            }
        }

        if chunks.is_empty() {
            self.chunk_by_size(code)
        } else {
            Ok(chunks)
        }
    }

    fn chunk_by_size(&self, code: &str) -> ChunkingResult<Vec<Chunk>> {
        let mut chunks = Vec::new();
        let chars: Vec<char> = code.chars().collect();
        let mut start = 0;

        while start < chars.len() {
            let end = (start + self.config.chunk_size).min(chars.len());
            let chunk_text: String = chars[start..end].iter().collect();

            chunks.push(self.create_chunk(&chunk_text, start)?);

            start = end.saturating_sub(self.config.chunk_overlap);
        }

        Ok(chunks)
    }

    fn create_chunk(&self, content: &str, start_index: usize) -> ChunkingResult<Chunk> {
        let token_count = content.split_whitespace().count();
        let char_count = content.chars().count();

        Ok(Chunk {
            id: format!("code_chunk_{}_{}", self.language, start_index),
            content: content.to_string(),
            start_index,
            end_index: start_index + char_count,
            metadata: ChunkMetadata {
                strategy: ChunkingStrategy::CodeAware,
                language: Some(self.language.clone()),
                token_count,
                char_count,
                overlap: self.config.chunk_overlap,
            },
        })
    }
}

impl Chunker for CodeAwareChunker {
    fn chunk(&self, code: &str) -> ChunkingResult<ChunkOutput> {
        if code.trim().is_empty() {
            return Err(ChunkingError::EmptyDocument);
        }

        let chunks = match self.language.as_str() {
            "rs" => self.chunk_rust(code)?,
            "py" => self.chunk_python(code)?,
            "js" | "ts" => self.chunk_javascript(code)?,
            "java" => self.chunk_java(code)?,
            "go" => self.chunk_go(code)?,
            "cpp" | "c" | "h" | "hpp" => self.chunk_cpp(code)?,
            _ => self.chunk_generic(code)?,
        };

        let total_tokens: usize = chunks.iter().map(|c| c.metadata.token_count).sum();

        Ok(ChunkOutput {
            chunks,
            total_chunks: chunks.len(),
            total_tokens,
            strategy: ChunkingStrategy::CodeAware,
        })
    }

    fn strategy(&self) -> ChunkingStrategy {
        ChunkingStrategy::CodeAware
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_code_aware_chunker_rust() {
        let chunker = CodeAwareChunker::new(ChunkingConfig::default(), "rs");
        let code =
            "fn main() {\n    println!(\"Hello\");\n}\n\nfn test() {\n    println!(\"World\");\n}";

        let result = chunker.chunk(code).unwrap();
        assert!(!result.chunks.is_empty());
        assert_eq!(result.strategy, ChunkingStrategy::CodeAware);
    }

    #[test]
    fn test_code_aware_chunker_python() {
        let chunker = CodeAwareChunker::new(ChunkingConfig::default(), "py");
        let code = "def main():\n    print(\"Hello\")\n\ndef test():\n    print(\"World\")";

        let result = chunker.chunk(code).unwrap();
        assert!(!result.chunks.is_empty());
    }
}
