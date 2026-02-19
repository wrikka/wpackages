use pulldown_cmark::{Event, Tag, CodeBlockKind, TagEnd};
use syntect::parsing::SyntaxSet;
use syntect::highlighting::{ThemeSet};
use syntect::html::{ClassedHTMLGenerator, ClassStyle};
use lazy_static::lazy_static;
use crate::components::plugins::Plugin;

lazy_static! {
    static ref SYNTAX_SET: SyntaxSet = SyntaxSet::load_defaults_newlines();
    static ref THEME_SET: ThemeSet = ThemeSet::load_defaults();
}

pub struct SyntaxHighlightingPlugin;

impl Plugin for SyntaxHighlightingPlugin {
    fn process<'a>(
        &self,
        events: Box<dyn Iterator<Item = Event<'a>> + 'a>,
    ) -> Box<dyn Iterator<Item = Event<'a>> + 'a> {
        let mut in_code_block = false;
        let mut lang = String::new();

        Box::new(events.flat_map(move |event| {
            match event {
                Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(ref lang_str))) => {
                    in_code_block = true;
                    lang = lang_str.to_string();
                    vec![event]
                }
                Event::End(TagEnd::CodeBlock) => {
                    in_code_block = false;
                    vec![event]
                }
                Event::Text(text) if in_code_block => {
                    let syntax = SYNTAX_SET.find_syntax_by_token(&lang).unwrap_or_else(|| SYNTAX_SET.find_syntax_plain_text());
                    let mut html_generator = ClassedHTMLGenerator::new_with_class_style(syntax, &SYNTAX_SET, ClassStyle::Spaced);

                    for line in text.lines() {
                        let _ = html_generator.parse_html_for_line_which_includes_newline(line);
                    }

                    vec![Event::Html(html_generator.finalize().into())]
                }
                _ => vec![event],
            }
        }))
    }
}
