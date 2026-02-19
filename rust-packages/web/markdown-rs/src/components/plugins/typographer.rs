use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use pulldown_cmark::Event;

pub struct TypographerPlugin;

impl Plugin for TypographerPlugin {
    fn process<'a>(&self, flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        if !flags.smart_punctuation {
            return false;
        }

        for event in events.iter_mut() {
            if let Event::Text(text) = event {
                let mut new_text = text.to_string();
                new_text = new_text.replace("---", "—");
                new_text = new_text.replace("--", "–");
                new_text = new_text.replace("...", "…");
                new_text = new_text.replace("'", "’");
                new_text = new_text.replace("\"", "”");
                *text = new_text.into();
            }
        }

        true
    }
}
