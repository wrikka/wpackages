use pulldown_cmark::{Event, Tag, TagEnd};
use crate::components::plugins::Plugin;
use crate::config::RenderFlags;

pub struct AdmonitionPlugin;

impl Plugin for AdmonitionPlugin {
    fn process<'a>(&self, _flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        let mut old_events = std::mem::take(events);
        let mut new_events = Vec::with_capacity(old_events.len());
        let mut iter = old_events.drain(..).peekable();
        let mut changed = false;

        while let Some(event) = iter.next() {
            if let Event::Start(Tag::Paragraph) = &event {
                if let Some(Event::Text(text)) = iter.peek() {
                    if text.starts_with(":::") {
                        let parts: Vec<&str> = text.split_whitespace().collect();
                        if parts.len() > 1 {
                            let admonition_type = parts[1].to_string();
                            iter.next(); // Consume text
                            iter.next(); // Consume End(Paragraph)

                            changed = true;
                            new_events.push(Event::Html(format!("<div class=\"admonition {}\">", admonition_type).into()));

                            let mut nesting = 0;
                            while let Some(inner_event) = iter.next() {
                                if let Event::Start(Tag::Paragraph) = &inner_event {
                                    if let Some(Event::Text(inner_text)) = iter.peek() {
                                        if inner_text.starts_with(":::") {
                                            nesting += 1;
                                        }
                                    }
                                }

                                if let Event::End(TagEnd::Paragraph) = &inner_event {
                                    if let Some(Event::Text(inner_text)) = new_events.last() {
                                        if inner_text.trim() == ":::" {
                                            if nesting == 0 {
                                                new_events.pop(); // Remove the ::: text
                                                break;
                                            } else {
                                                nesting -= 1;
                                            }
                                        }
                                    }
                                }
                                new_events.push(inner_event);
                            }
                            new_events.push(Event::Html("</div>".into()));
                            continue;
                        }
                    }
                }
            }
            new_events.push(event);
        }

        *events = new_events;
        changed
    }
}
