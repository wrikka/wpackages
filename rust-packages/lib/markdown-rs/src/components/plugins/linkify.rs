use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use pulldown_cmark::{Event, LinkType, Tag, TagEnd};
use regex::Regex;

pub struct LinkifyPlugin;

impl Plugin for LinkifyPlugin {
    fn process<'a>(&self, flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        if !flags.linkify {
            return false;
        }

        let mut new_events = Vec::new();
        let re = Regex::new(r"(https?://[\w\d\.\-/?=&]+)").unwrap();

        for event in events.drain(..) {
            if let Event::Text(text) = event {
                let mut last_end = 0;
                for mat in re.find_iter(&text) {
                    if mat.start() > last_end {
                        new_events.push(Event::Text(text[last_end..mat.start()].to_string().into()));
                    }
                    let link_text = &text[mat.start()..mat.end()];
                    new_events.push(Event::Start(Tag::Link {
                        link_type: LinkType::Inline,
                        dest_url: link_text.to_string().into(),
                        title: "".into(),
                        id: "".into(),
                    }));
                    new_events.push(Event::Text(link_text.to_string().into()));
                    new_events.push(Event::End(TagEnd::Link));
                    last_end = mat.end();
                }
                if last_end < text.len() {
                    new_events.push(Event::Text(text[last_end..].to_string().into()));
                }
            } else {
                new_events.push(event);
            }
        }

        *events = new_events;
        true
    }
}
