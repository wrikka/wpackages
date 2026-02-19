//! dsl/codegen.rs

use crate::dsl::grammar::AgentDefinition;

/// Generates Rust code from an `AgentDefinition` AST.
pub struct CodeGenerator;

impl CodeGenerator {
    /// Generates a complete Rust source file as a string.
    pub fn generate(ast: &AgentDefinition) -> String {
        // For this demonstration, we'll generate code that uses the basic_agent template.
        format!(
            r#"// Auto-generated code for agent: {}

use ai_agent::templates::basic;

pub fn create_{}_agent() -> impl Sized /* Replace with actual type */ {{
    println!("Creating agent: {}");
    basic::new_basic_agent()
}}
"#,
            ast.name,
            ast.name.to_lowercase(),
            ast.name
        )
    }
}
