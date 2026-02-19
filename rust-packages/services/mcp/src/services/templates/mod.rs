pub mod template;
pub mod generator;
pub mod resolver;

pub use template::{ResourceTemplate, TemplateVariable, TemplatePattern};
pub use generator::{TemplateGenerator, GeneratorConfig};
pub use resolver::{TemplateResolver, ResolutionContext, ResolutionResult};
