use chromiumoxide::cdp::browser_protocol::network::{EventRequestWillBeSent, EventResponseReceived, EventLoadingFinished};

#[derive(Debug, Clone)]
pub enum NetworkEvent {
    RequestWillBeSent(EventRequestWillBeSent),
    ResponseReceived(EventResponseReceived),
    LoadingFinished(EventLoadingFinished),
}
