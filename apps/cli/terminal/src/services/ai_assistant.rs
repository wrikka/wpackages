use anyhow::{Context, Result};
use candle_core::{Device, Tensor};
use candle_transformers::models::bert::{BertModel, Config as BertConfig};
use candle_nn::VarBuilder;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct AIModel {
    pub name: String,
    pub model_type: ModelType,
    pub device: Device,
}

#[derive(Debug, Clone)]
pub enum ModelType {
    CommandSuggestion,
    ErrorAnalysis,
    ContextAware,
    CodeCompletion,
}

#[derive(Debug, Clone)]
pub struct CommandSuggestion {
    pub command: String,
    pub confidence: f32,
    pub explanation: String,
    pub related_commands: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ErrorAnalysis {
    pub error_type: String,
    pub likely_cause: String,
    pub suggested_fix: String,
    pub confidence: f32,
}

#[derive(Debug, Clone)]
pub struct ProjectContext {
    pub language: String,
    pub framework: Option<String>,
    pub dependencies: Vec<String>,
    pub recent_files: Vec<String>,
    pub git_branch: Option<String>,
}

pub struct AIAssistant {
    models: Arc<RwLock<HashMap<String, Arc<BertModel>>>>,
    device: Device,
    project_context: Arc<RwLock<Option<ProjectContext>>>,
}

impl AIAssistant {
    pub async fn new(device: Device) -> Result<Self> {
        Ok(Self {
            models: Arc::new(RwLock::new(HashMap::new())),
            device,
            project_context: Arc::new(RwLock::new(None)),
        })
    }

    pub async fn load_model(&self, name: String, model_type: ModelType) -> Result<()> {
        let config = BertConfig::tiny_en();
        let vb = VarBuilder::empty(&self.device);
        let model = BertModel::load(vb, &config)?;

        self.models.write().insert(name.clone(), Arc::new(model));

        Ok(())
    }

    pub async fn suggest_command(&self, partial: &str, context: &str) -> Result<Vec<CommandSuggestion>> {
        let mut suggestions = Vec::new();

        let common_commands = self.get_common_commands(partial);
        for (cmd, conf) in common_commands {
            suggestions.push(CommandSuggestion {
                command: cmd.clone(),
                confidence: conf,
                explanation: self.explain_command(&cmd),
                related_commands: self.get_related_commands(&cmd),
            });
        }

        suggestions.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());
        Ok(suggestions.into_iter().take(5).collect())
    }

    pub async fn analyze_error(&self, error_output: &str, command: &str) -> Result<ErrorAnalysis> {
        let error_patterns = [
            ("command not found", "Command not installed or not in PATH"),
            ("permission denied", "Insufficient permissions, try with sudo"),
            ("No such file or directory", "File or directory does not exist"),
            ("connection refused", "Service not running or wrong port"),
            ("syntax error", "Invalid command syntax"),
        ];

        let mut error_type = "Unknown Error".to_string();
        let mut likely_cause = "Unknown cause".to_string();
        let mut suggested_fix = "Check the command and try again".to_string();
        let mut confidence = 0.5;

        for (pattern, cause) in error_patterns {
            if error_output.to_lowercase().contains(pattern) {
                error_type = pattern.to_string();
                likely_cause = cause.to_string();
                suggested_fix = self.get_fix_for_error(pattern, command);
                confidence = 0.8;
                break;
            }
        }

        Ok(ErrorAnalysis {
            error_type,
            likely_cause,
            suggested_fix,
            confidence,
        })
    }

    pub async fn get_context_suggestions(&self, current_dir: &str) -> Result<Vec<String>> {
        let mut suggestions = Vec::new();

        if let Some(context) = self.project_context.read().as_ref() {
            match context.language.as_str() {
                "rust" => {
                    suggestions.push("cargo run".to_string());
                    suggestions.push("cargo test".to_string());
                    suggestions.push("cargo build --release".to_string());
                }
                "javascript" | "typescript" => {
                    suggestions.push("npm run dev".to_string());
                    suggestions.push("npm test".to_string());
                    suggestions.push("npm run build".to_string());
                }
                "python" => {
                    suggestions.push("python main.py".to_string());
                    suggestions.push("python -m pytest".to_string());
                    suggestions.push("pip install -r requirements.txt".to_string());
                }
                _ => {}
            }
        }

        Ok(suggestions)
    }

    pub fn update_project_context(&self, context: ProjectContext) {
        *self.project_context.write() = Some(context);
    }

    pub async fn auto_complete_command(&self, partial: &str) -> Result<Vec<String>> {
        let commands = vec![
            "git status", "git add", "git commit", "git push", "git pull",
            "docker ps", "docker build", "docker run", "docker-compose up",
            "npm install", "npm run", "npm test", "npm build",
            "cargo run", "cargo test", "cargo build", "cargo check",
            "ls -la", "cd ..", "pwd", "mkdir", "rm -rf",
            "grep -r", "find . -name", "cat", "less", "tail -f",
        ];

        let matches: Vec<String> = commands
            .iter()
            .filter(|cmd| cmd.starts_with(partial))
            .cloned()
            .collect();

        Ok(matches)
    }

    fn get_common_commands(&self, partial: &str) -> Vec<(String, f32)> {
        let commands = vec![
            ("git status", 0.95),
            ("git add .", 0.90),
            ("git commit -m", 0.88),
            ("git push", 0.85),
            ("ls -la", 0.92),
            ("cd ..", 0.90),
            ("pwd", 0.88),
            ("npm install", 0.85),
            ("npm run dev", 0.87),
            ("cargo run", 0.86),
            ("docker ps", 0.84),
            ("docker-compose up", 0.83),
        ];

        commands
            .into_iter()
            .filter(|(cmd, _)| cmd.starts_with(partial))
            .collect()
    }

    fn explain_command(&self, command: &str) -> String {
        match command {
            "git status" => "Shows the working tree status".to_string(),
            "git add ." => "Stages all changes for commit".to_string(),
            "git commit -m" => "Creates a new commit with a message".to_string(),
            "git push" => "Uploads local commits to remote repository".to_string(),
            "ls -la" => "Lists all files including hidden ones with details".to_string(),
            "cd .." => "Changes directory to parent".to_string(),
            "pwd" => "Prints current working directory".to_string(),
            "npm install" => "Installs dependencies from package.json".to_string(),
            "npm run dev" => "Runs the development script".to_string(),
            "cargo run" => "Compiles and runs the Rust project".to_string(),
            "docker ps" => "Lists running Docker containers".to_string(),
            "docker-compose up" => "Starts services defined in docker-compose.yml".to_string(),
            _ => format!("Executes: {}", command),
        }
    }

    fn get_related_commands(&self, command: &str) -> Vec<String> {
        match command {
            cmd if cmd.starts_with("git") => vec![
                "git status".to_string(),
                "git diff".to_string(),
                "git log".to_string(),
                "git branch".to_string(),
            ],
            cmd if cmd.starts_with("docker") => vec![
                "docker ps".to_string(),
                "docker images".to_string(),
                "docker logs".to_string(),
                "docker exec".to_string(),
            ],
            cmd if cmd.starts_with("npm") => vec![
                "npm install".to_string(),
                "npm update".to_string(),
                "npm run".to_string(),
                "npm test".to_string(),
            ],
            _ => vec![],
        }
    }

    fn get_fix_for_error(&self, error_type: &str, command: &str) -> String {
        match error_type {
            "command not found" => format!("Install the command or add it to PATH. Try: sudo apt install {}", command.split_whitespace().next().unwrap_or("package")),
            "permission denied" => format!("Try running with sudo: sudo {}", command),
            "No such file or directory" => "Check if the file/directory exists and the path is correct".to_string(),
            "connection refused" => "Check if the service is running and the port is correct".to_string(),
            "syntax error" => "Check the command syntax and try again".to_string(),
            _ => "Review the error message and command for issues".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_ai_assistant() {
        let assistant = AIAssistant::new(Device::Cpu).await.unwrap();

        let suggestions = assistant.suggest_command("git", "").await.unwrap();
        assert!(!suggestions.is_empty());
    }
}
