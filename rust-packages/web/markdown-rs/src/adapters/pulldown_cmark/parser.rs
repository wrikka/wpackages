use crate::config::RenderFlags;
use pulldown_cmark::{Event, Options, Parser};

fn get_parser_options(flags: RenderFlags) -> Options {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);

    if flags.gfm {
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TASKLISTS);
    }

    if flags.footnotes {
        options.insert(Options::ENABLE_FOOTNOTES);
    }

    options
}


pub fn create_parser<'a>(input: &'a str, flags: RenderFlags) -> Box<dyn Iterator<Item = Event<'a>> + 'a> {
    let options = get_parser_options(flags);
    let callback = |link: pulldown_cmark::BrokenLink<'a>| {
        if link.reference.starts_with("javascript:") {
            Some(("".into(), "".into()))
        } else {
            Some((link.reference, "".into()))
        }
    };

    if flags.sanitize {
        Box::new(Parser::new_with_broken_link_callback(input, options, Some(callback)))
    } else {
        Box::new(Parser::new_with_broken_link_callback(input, options, None::<fn(pulldown_cmark::BrokenLink<'a>) -> Option<(pulldown_cmark::CowStr<'a>, pulldown_cmark::CowStr<'a>)>>))
    }
}
