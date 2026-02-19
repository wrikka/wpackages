use crate::components::render::render_to_html_string;
use crate::config::RenderFlags;

pub fn generate_toc_html(input: &str) -> String {
    let toc_markdown = pulldown_cmark_toc::TableOfContents::new(input).to_cmark();
    if toc_markdown.is_empty() {
        return String::new();
    }

    let flags = RenderFlags { toc: false, ..Default::default() };
    let toc_html = render_to_html_string(&toc_markdown, flags);
    toc_html.replacen("<ul>", r#"<ul class="toc">"#, 1)
}
