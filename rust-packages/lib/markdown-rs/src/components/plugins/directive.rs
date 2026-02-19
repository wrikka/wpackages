use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use pulldown_cmark::{CowStr, Event, Tag, TagEnd};

pub struct DirectivePlugin;

impl Plugin for DirectivePlugin {
    fn process<'a>(&self, flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        if !flags.directives {
            return false;
        }
        
        let mut changed = false;
        let mut i = 0;
        while i < events.len() {
            if i + 2 < events.len() {
                if let (
                    Event::Start(Tag::Paragraph),
                    Event::Text(text),
                    Event::End(TagEnd::Paragraph),
                ) = (&events[i], &events[i + 1], &events[i + 2]) {
                    if text.starts_with("::") {
                        if let Some(end_directive_pos) = text.find('[') {
                            let name = &text[2..end_directive_pos];
                            if let Some(end_content_pos) = text.rfind(']') {
                                let content = &text[end_directive_pos + 1..end_content_pos];
                                let html = match name {
                                    "youtube" => Some(format!(
                                        r#"<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/{}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" allowfullscreen frameborder="0"></iframe></div>"#,
                                        content
                                    )),
                                    "note" => Some(format!("<div class=\"note\">{}</div>", content)),
                                    _ => None,
                                };

                                if let Some(html_content) = html {
                                    let directive_event = Event::Html(CowStr::from(html_content));
                                    events.splice(i..=i + 2, std::iter::once(directive_event));
                                    changed = true;
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
            i += 1;
        }
        changed
    }
}
