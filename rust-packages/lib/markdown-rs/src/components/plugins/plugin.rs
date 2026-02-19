use pulldown_cmark::Event;

pub trait Plugin: Send + Sync {
    fn process<'a>(
        &self,
        events: Box<dyn Iterator<Item = Event<'a>> + 'a>,
    ) -> Box<dyn Iterator<Item = Event<'a>> + 'a>;
}
