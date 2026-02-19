use crate::components::{ast::build_ast, render::render_to_html_string};
use crate::config::RenderFlags;
use crate::adapters::pulldown_cmark::parser::create_parser;


pub fn render(input: String) -> String {
    let flags = RenderFlags {
        sanitize: true,
        ..RenderFlags::default()
    };
    render_to_html_string(&input, flags)
}


pub fn render_with_options(input: String, flags: RenderFlags) -> String {
    render_to_html_string(&input, flags)
}

pub fn parse(input: String) -> String {
        let flags = RenderFlags {
        gfm: true,
        footnotes: true,
        ..Default::default()
    };
    let mut parser = create_parser(&input, flags);
    let ast = build_ast(&mut parser);
    serde_json::to_string(&ast).unwrap_or_else(|_| "null".to_string())
}

// Exposed for benchmarks and tests
pub fn render_unsafe(input: &str) -> String {
    render_to_html_string(input, RenderFlags::default())
}

pub fn render_unsafe_no_highlight(input: &str) -> String {
    let flags = RenderFlags {
        syntax_highlight: false,
        ..Default::default()
    };
    render_to_html_string(input, flags)
}
