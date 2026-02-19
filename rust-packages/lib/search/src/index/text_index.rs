use crate::index::{IndexMatch, IndexedFile, SearchIndex};
use dashmap::DashMap;
use std::path::PathBuf;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct TextLine {
    pub line: usize,
    pub text: String,
}

pub struct TextIndex {
    file_lines: DashMap<PathBuf, Vec<TextLine>>,
    word_index: DashMap<String, Vec<(PathBuf, usize)>>,
}

impl TextIndex {
    pub fn new() -> Self {
        Self {
            file_lines: DashMap::new(),
            word_index: DashMap::new(),
        }
    }
    
    pub fn index_file(&self, path: &PathBuf, content: &str) {
        self.remove_file(path).ok();
        
        let lines: Vec<TextLine> = content
            .lines()
            .enumerate()
            .map(|(idx, line)| TextLine {
                line: idx + 1,
                text: line.to_string(),
            })
            .collect();
        
        for line in &lines {
            for word in tokenize_line(&line.text) {
                self.word_index
                    .entry(word)
                    .or_insert_with(Vec::new)
                    .push((path.clone(), line.line));
            }
        }
        
        self.file_lines.insert(path.clone(), lines);
    }
    
    pub fn search_word(&self, word: &str, limit: usize) -> Vec<IndexMatch> {
        let word_lower = word.to_lowercase();
        let mut results = Vec::new();
        
        for entry in self.word_index.iter() {
            let (indexed_word, locations) = entry.pair();
            if indexed_word.contains(&word_lower) {
                for (path, line_num) in locations {
                    if results.len() >= limit {
                        break;
                    }
                    
                    if let Some(lines) = self.file_lines.get(path) {
                        if let Some(line) = lines.iter().find(|l| l.line == *line_num) {
                            results.push(IndexMatch {
                                path: path.to_string_lossy().into_owned(),
                                line: line.line,
                                column: 0,
                                text: line.text.clone(),
                                kind: "text".to_string(),
                                score: 1.0,
                            });
                        }
                    }
                }
            }
        }
        
        results.truncate(limit);
        results
    }
    
    pub fn search_regex(&self, pattern: &str, limit: usize) -> anyhow::Result<Vec<IndexMatch>> {
        use regex::Regex;
        
        let re = Regex::new(pattern)?;
        let mut results = Vec::new();
        
        for entry in self.file_lines.iter() {
            let (path, lines) = entry.pair();
            for line in lines {
                if results.len() >= limit {
                    break;
                }
                
                if re.is_match(&line.text) {
                    results.push(IndexMatch {
                        path: path.to_string_lossy().into_owned(),
                        line: line.line,
                        column: 0,
                        text: line.text.clone(),
                        kind: "regex".to_string(),
                        score: 1.0,
                    });
                }
            }
        }
        
        Ok(results)
    }
    
    pub fn get_file_lines(&self, path: &PathBuf) -> Option<Vec<TextLine>> {
        self.file_lines.get(path).map(|l| l.clone())
    }
}

fn tokenize_line(line: &str) -> Vec<String> {
    line.split(|c: char| !c.is_alphanumeric())
        .filter(|s| s.len() > 2)
        .map(|s| s.to_lowercase())
        .collect()
}

impl SearchIndex for TextIndex {
    fn search(&self, query: &str, limit: usize) -> Vec<IndexMatch> {
        self.search_word(query, limit)
    }
    
    fn search_by_kind(&self, _kind: &str, query: &str, limit: usize) -> Vec<IndexMatch> {
        self.search_word(query, limit)
    }
    
    fn update_file(&self, path: &PathBuf, content: &str) -> anyhow::Result<()> {
        self.index_file(path, content);
        Ok(())
    }
    
    fn remove_file(&self, path: &PathBuf) -> anyhow::Result<()> {
        if let Some((_, lines)) = self.file_lines.remove(path) {
            for line in lines {
                for word in tokenize_line(&line.text) {
                    if let Some(mut locations) = self.word_index.get_mut(&word) {
                        locations.retain(|(p, l)| p != path || *l != line.line);
                    }
                }
            }
        }
        Ok(())
    }
    
    fn stats(&self) -> crate::index::IndexStats {
        let total_files = self.file_lines.len();
        let total_lines: usize = self.file_lines.iter().map(|e| e.value().len()).sum();
        
        crate::index::IndexStats {
            total_files,
            total_symbols: total_lines,
            total_size: 0,
            last_updated: 0,
            index_path: PathBuf::new(),
        }
    }
    
    fn persist(&self) -> anyhow::Result<()> {
        Ok(())
    }
    
    fn load(&self) -> anyhow::Result<()> {
        Ok(())
    }
}
