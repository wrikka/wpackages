use pulldown_cmark::html;
use crate::config::RenderFlags;
use crate::adapters::pulldown_cmark::parser::create_parser;
use crate::components::plugins::Plugin;

pub fn render_to_html_string(input: &str, flags: RenderFlags) -> String {
    let mut html_output = String::with_capacity(input.len() * 2);
    let parser = create_parser(input, flags);

    // Fast path for when no plugins are enabled and no sanitization is needed
    if !flags.syntax_highlight && !flags.toc && !flags.directives && !flags.sanitize {
        html::push_html(&mut html_output, parser);
        return html_output;
    }

    // Slower path: process events through a streaming pipeline
    let mut stream: Box<dyn Iterator<Item = _>> = Box::new(parser);

    if flags.toc {
        let plugin = crate::components::plugins::toc::TocPlugin;
        stream = plugin.process(stream);
    }

    if flags.syntax_highlight {
        let plugin = crate::components::plugins::syntax_highlighting::SyntaxHighlightingPlugin;
        stream = plugin.process(stream);
    }

    html::push_html(&mut html_output, stream);

    html_output
}
