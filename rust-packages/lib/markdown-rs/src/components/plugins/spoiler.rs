use pulldown_cmark::{Event, Tag, TagEnd};
use crate::components::plugins::Plugin;
use crate::config::RenderFlags;

pub struct SpoilerPlugin;

impl Plugin for SpoilerPlugin {
    fn process<'a>(&self, _flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        let mut new_events = Vec::with_capacity(events.len());
        let mut in_spoiler = false;
        let mut changed = false;

        for event in events.drain(..) {
            match &event {
                Event::Html(html) if html.trim() == "<spoiler>" => {
                    in_spoiler = true;
                    changed = true;
                    new_events.push(Event::Start(Tag::HtmlBlock));
                    new_events.push(Event::Html("<details><summary>Spoiler</summary>".into()));
                }
                Event::Html(html) if html.trim() == "</spoiler>" && in_spoiler => {
                    in_spoiler = false;
                    new_events.push(Event::Html("</details>".into()));
                    new_events.push(Event::End(TagEnd::HtmlBlock));
                }
                _ => {
                    new_events.push(event);
                }
            }
        }
        *events = new_events;
        changed
    }
}
