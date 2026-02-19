use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use lazy_static::lazy_static;
use pulldown_cmark::{Event, Tag};
use regex::Regex;

lazy_static! {
    static ref ATTR_RE: Regex = Regex::new(r"\s*\{\s*([#.].*?)\s*\}\s*$").unwrap();
}

pub struct AttributesPlugin;

impl Plugin for AttributesPlugin {
    fn process<'a>(&self, _flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        let mut changed = false;
        let mut new_events = Vec::with_capacity(events.len());
        let mut last_start_tag_idx: Option<usize> = None;

        for event in events.drain(..) {
            if let Event::Text(text) = &event {
                if let Some(captures) = ATTR_RE.captures(text) {
                    if let Some(attrs_str) = captures.get(1) {
                        if let Some(start_idx) = last_start_tag_idx {
                            let mut id = "";
                            let mut classes = Vec::new();

                            for part in attrs_str.as_str().split_whitespace() {
                                if part.starts_with('#') {
                                    id = &part[1..];
                                } else if part.starts_with('.') {
                                    classes.push(&part[1..]);
                                }
                            }

                            if let Event::Start(tag) = &new_events[start_idx] {
                                let new_tag_html = match tag {
                                    Tag::Paragraph => format!("<p id=\"{}\" class=\"{}\">", id, classes.join(" ")),
                                    Tag::Heading { level, .. } => format!("<h{} id=\"{}\" class=\"{}\">", level, id, classes.join(" ")),
                                    _ => "".to_string(),
                                };

                                if !new_tag_html.is_empty() {
                                    new_events[start_idx] = Event::Html(new_tag_html.into());
                                    let original_text = text.trim_end_matches(captures.get(0).unwrap().as_str());
                                    if !original_text.is_empty() {
                                        new_events.push(Event::Text(original_text.to_string().into()));
                                    }
                                    changed = true;
                                    last_start_tag_idx = None; // Consume the attribute
                                    continue;
                                }
                            }
                        }
                    }
                }
            }

            if let Event::Start(_) = &event {
                last_start_tag_idx = Some(new_events.len());
            } else if let Event::End(_) = &event {
                last_start_tag_idx = None;
            }

            new_events.push(event);
        }

        if changed {
            *events = new_events;
        }

        changed
    }
}
