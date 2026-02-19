pub mod actions;
pub mod debug;
pub mod info;
pub mod navigation;
pub mod queries;
pub mod tabs;
pub mod scripting;
pub mod snapshots;
pub mod vision;
pub mod analysis;
pub mod waits;
pub mod history;
pub mod network;
pub mod network_logger;
pub mod har;
pub mod cookies;
pub mod websockets;
pub mod forms;
pub mod geolocation;

use crate::error::{Error, Result};
use crate::protocol::{Action, Params, Response, SnapshotNode, history::ActionRecord, network::InterceptedRequest, params as protocol_params, websockets::WebSocketFrame};
use crate::browser::network_logger::NetworkEvent;
use crate::snapshot::SnapshotBuilder;
use chromiumoxide::browser::{Browser, BrowserConfig};
use chromiumoxide::cdp::browser_protocol::{dom as cdp_dom, fetch};
use chromiumoxide::element::Element;
use chromiumoxide::Page;
use futures::StreamExt;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use chrono::Utc;

#[derive(Default)]
pub struct PageState {
    pub url: Option<String>,
    pub title: Option<String>,
}

pub struct SessionState {
    pub headless: bool,
    pub browser: Browser,
    pub _handler_task: JoinHandle<()>, 
    pub active_page: Option<Page>,
    pub page_state: PageState,
    pub last_snapshot: Option<Vec<SnapshotNode>>,
    pub action_history: Vec<ActionRecord>,
    pub network_requests: Vec<InterceptedRequest>,
    pub network_events: Vec<NetworkEvent>,
    pub websocket_frames: Vec<WebSocketFrame>,
    pub snapshot_builder: Arc<Mutex<SnapshotBuilder>>,
}

pub struct BrowserManager {
    sessions: Arc<Mutex<HashMap<String, Arc<Mutex<SessionState>>>>>, 
}

impl BrowserManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    async fn get_or_create_session(&self, session_id: &str, headless: bool, datadir: Option<&str>, stealth: bool) -> Result<Arc<Mutex<SessionState>>> {
        let mut sessions = self.sessions.lock().await;

        if let Some(existing) = sessions.get(session_id) {
            let mut existing_guard = existing.lock().await;
            if existing_guard.headless == headless {
                return Ok(existing.clone());
            }
            // If headless mode is different, we need to shut down the old browser and create a new one.
            existing_guard.browser.close().await?;
            sessions.remove(session_id);
        }

        let mut cfg_builder = BrowserConfig::builder();
        if !headless {
            cfg_builder = cfg_builder.with_head();
        }
        if let Some(dir) = datadir {
            cfg_builder = cfg_builder.user_data_dir(dir);
        }
        
        let mut cfg = cfg_builder.build()?;
        if stealth {
            cfg.stealth();
        }

        let (browser, mut handler) = Browser::launch(cfg)
            .await
            .map_err(|e| Error::Browser(e.to_string()))?;

        let handler_task = tokio::spawn(async move {
            while let Some(h) = handler.next().await {
                if h.is_err() {
                    break;
                }
            }
        });

        let session = Arc::new(Mutex::new(SessionState {
            headless,
            browser,
            _handler_task: handler_task,
            active_page: None,
            page_state: PageState::default(),
            last_snapshot: None,
            action_history: Vec::new(),
            network_requests: Vec::new(),
            network_events: Vec::new(),
            websocket_frames: Vec::new(),
            snapshot_builder: Arc::new(Mutex::new(SnapshotBuilder::new())),
        }));
        sessions.insert(session_id.to_string(), session.clone());
        Ok(session)
    }

    /// Find an element with self-healing selector capability
    pub(super) async fn find_element_with_healing(
        &self,
        session: &mut SessionState,
        selector: &str,
    ) -> Result<chromiumoxide::element::Element> {
        let page = session.active_page.as_mut().ok_or(Error::NoPage)?;
        page.find_element(selector)
            .await
            .map_err(|e| Error::ElementNotFound(format!("{}: {}", selector, e)))
    }

    async fn setup_network_interception(session: Arc<Mutex<SessionState>>, page: &Page) -> Result<()> {
        let mut events = page.event_stream::<fetch::EventRequestPaused>().await?;
        let page_clone = page.clone();

        tokio::spawn(async move {
            while let Some(Ok(event)) = events.next().await {
                let mut session_guard = session.lock().await;
                let req = &event.request;
                session_guard.network_requests.push(InterceptedRequest {
                    url: req.url.clone(),
                    method: req.method.clone(),
                    headers: req.headers.clone(),
                    post_data: req.post_data.clone(),
                });

                let params = fetch::ContinueRequestParams::builder()
                    .request_id(event.request_id.clone())
                    .build();

                if let Err(e) = page_clone.execute(params).await {
                    tracing::error!("Failed to continue request: {}", e);
                }
            }
        });

        page.execute(fetch::EnableParams::default()).await?;
        Ok(())
    }

    async fn setup_har_logging(session: Arc<Mutex<SessionState>>, page: &Page) -> Result<()> {
        let mut req_events = page.event_stream::<chromiumoxide::cdp::browser_protocol::network::EventRequestWillBeSent>().await?;
        let mut res_events = page.event_stream::<chromiumoxide::cdp::browser_protocol::network::EventResponseReceived>().await?;
        let mut fin_events = page.event_stream::<chromiumoxide::cdp::browser_protocol::network::EventLoadingFinished>().await?;

        let session_clone = session.clone();
        tokio::spawn(async move {
            while let Some(Ok(event)) = req_events.next().await {
                session_clone.lock().await.network_events.push(NetworkEvent::RequestWillBeSent(event));
            }
        });

        let session_clone = session.clone();
        tokio::spawn(async move {
            while let Some(Ok(event)) = res_events.next().await {
                session_clone.lock().await.network_events.push(NetworkEvent::ResponseReceived(event));
            }
        });

        tokio::spawn(async move {
            while let Some(Ok(event)) = fin_events.next().await {
                session.lock().await.network_events.push(NetworkEvent::LoadingFinished(event));
            }
        });

        page.execute(chromiumoxide::cdp::browser_protocol::network::EnableParams::default()).await?;
        Ok(())
    }

    async fn setup_websocket_logging(session: Arc<Mutex<SessionState>>, page: &Page) -> Result<()> {
        let mut sent_events = page.event_stream::<chromiumoxide::cdp::browser_protocol::network::EventWebSocketFrameSent>().await?;
        let mut received_events = page.event_stream::<chromiumoxide::cdp::browser_protocol::network::EventWebSocketFrameReceived>().await?;

        let session_clone_sent = session.clone();
        tokio::spawn(async move {
            while let Some(Ok(event)) = sent_events.next().await {
                let frame = WebSocketFrame {
                    frame_type: crate::protocol::websockets::FrameType::Sent,
                    opcode: event.response.opcode,
                    mask: event.response.mask,
                    payload_data: event.response.payload_data,
                    timestamp: event.timestamp.to_string(),
                };
                session_clone_sent.lock().await.websocket_frames.push(frame);
            }
        });

        tokio::spawn(async move {
            while let Some(Ok(event)) = received_events.next().await {
                 let frame = WebSocketFrame {
                    frame_type: crate::protocol::websockets::FrameType::Received,
                    opcode: event.response.opcode,
                    mask: event.response.mask,
                    payload_data: event.response.payload_data,
                    timestamp: event.timestamp.to_string(),
                };
                session.lock().await.websocket_frames.push(frame);
            }
        });
        Ok(())
    }

    pub async fn execute_action(
        &self,
        action: Action,
        params: crate::protocol::Params,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> crate::error::Result<Option<serde_json::Value>> {
        let response = self.execute_action_internal(session_id, headless, datadir, stealth, action, params).await?;
        Ok(response.data)
    }

    async fn execute_action_internal(&self, session_id: &str, headless: bool, datadir: Option<&str>, stealth: bool, action: Action, params: crate::protocol::Params) -> Result<Response> {
        let session = self.get_or_create_session(session_id, headless, datadir, stealth).await?;
        
        let record = ActionRecord {
            timestamp: Utc::now().to_rfc3339(),
            action: action.clone(),
            params: params.clone(),
        };
        session.lock().await.action_history.push(record);

        let mut session_guard = session.lock().await;

        if let (Action::Open, Params::Open(p)) = (&action, &params) {
            let page = session_guard.browser.new_page(&p.url).await?;
            Self::setup_network_interception(session.clone(), &page).await?;
            Self::setup_har_logging(session.clone(), &page).await?;
            Self::setup_websocket_logging(session.clone(), &page).await?;
            session_guard.active_page = Some(page);
            return Ok(Response::success("open".to_string(), None));
        }

        if let Action::NewTab = action {
             let page = session_guard.browser.new_page("about:blank").await?;
            Self::setup_network_interception(session.clone(), &page).await?;
            Self::setup_har_logging(session.clone(), &page).await?;
            Self::setup_websocket_logging(session.clone(), &page).await?;
            session_guard.active_page = Some(page);
            return Ok(Response::success("new_tab".to_string(), None));
        }

        let result = match (action, params) {
            (Action::Back, _) => self.back(&mut session_guard).await?,
            (Action::Forward, _) => self.forward(&mut session_guard).await?,
            (Action::Reload, _) => self.reload(&mut session_guard).await?,

            (Action::Click, Params::Click(p)) => self.click_element(&mut session_guard, &p).await?,
            (Action::Type, Params::Type(p)) | (Action::TypeSecret, Params::TypeSecret(p)) => self.type_into_element(&mut session_guard, &p).await?,
            (Action::Fill, Params::Fill(p)) => self.fill_element(&mut session_guard, &p).await?,
            (Action::Hover, Params::Hover(p)) => self.hover_element(&mut session_guard, &p).await?,
            (Action::Scroll, Params::Scroll(p)) => self.scroll_element(&mut session_guard, &p).await?,
            (Action::Check, Params::Check(p)) => self.check_element(&mut session_guard, &p).await?,
            (Action::Uncheck, Params::Uncheck(p)) => self.uncheck_element(&mut session_guard, &p).await?,
            (Action::Upload, Params::Upload(p)) => self.upload_file(&mut session_guard, &p).await?,

            (Action::GetText, Params::GetText(p)) => self.get_text(&mut session_guard, &p).await?,
            (Action::GetHtml, Params::GetHtml(p)) => self.get_html(&mut session_guard, &p).await?,
            (Action::GetValue, Params::GetValue(p)) => self.get_value(&mut session_guard, &p).await?,
            (Action::GetAttr, Params::GetAttr(p)) => self.get_attr(&mut session_guard, &p).await?,
            (Action::GetTitle, _) => self.get_title(&session_guard.page_state).await?,
            (Action::GetUrl, _) => self.get_url(&session_guard.page_state).await?,

            (Action::IsVisible, Params::IsVisible(p)) => self.is_visible(&mut session_guard, &p).await?,
            (Action::IsEnabled, Params::IsEnabled(p)) => self.is_enabled(&mut session_guard, &p).await?,
            (Action::IsChecked, Params::IsChecked(p)) => self.is_checked(&mut session_guard, &p).await?,
            (Action::GetCount, Params::GetCount(p)) => self.get_count(&mut session_guard, &p).await?,
            (Action::ExtractTable, Params::ExtractTable(p)) => self.extract_table(&mut session_guard, &p).await?,

            (Action::Snapshot, _) => snapshots::snapshot(&mut session_guard).await?,
            (Action::DiffSnapshot, _) => snapshots::diff_snapshot(&mut session_guard).await?,
            (Action::VisualSnapshot, _) => vision::visual_snapshot(&mut session_guard).await?,

            (Action::SummarizePage, _) => analysis::summarize_page(&mut session_guard).await?,
            (Action::FindElement, Params::FindElement(p)) => analysis::find_element(&mut session_guard, &p).await?,

            (Action::WaitFor, Params::WaitFor(p)) => waits::wait_for(&mut session_guard, &p).await?,
            (Action::GetHistory, _) => history::get_history(&mut session_guard).await?,

            (Action::Network, _) => network::get_network_requests(&mut session_guard).await?,
            (Action::GetHar, _) => har::get_har(&mut session_guard).await?,

            (Action::GetCookies, _) => cookies::get_cookies(&mut session_guard).await?,
            (Action::AddCookie, Params::AddCookie(p)) => cookies::add_cookie(&mut session_guard, &p).await?,
            (Action::DeleteCookie, Params::DeleteCookie(p)) => cookies::delete_cookie(&mut session_guard, &p).await?,

            (Action::GetWebSocketFrames, _) => websockets::get_websocket_frames(&mut session_guard).await?,

            // Automation
            (Action::AutomatedFill, Params::AutomatedFill(p)) => forms::automated_fill(&mut session_guard, &p).await?,
            (Action::SetGeolocation, Params::SetGeolocation(p)) => geolocation::set_geolocation(&mut session_guard, &p).await?,

            (Action::Tabs, _) => tabs::get_tabs(&mut session_guard).await?,
            (Action::SwitchTab, Params::SwitchTab(p)) => tabs::switch_tab(&mut session_guard, &p).await?,
            (Action::CloseTab, Params::CloseTab(p)) => tabs::close_tab(&mut session_guard, &p).await?,

            (Action::Screenshot, Params::Screenshot(p)) => debug::screenshot(&mut session_guard, &p).await?,
            (Action::Console, _) => debug::get_console_logs(&mut session_guard).await?,

            (Action::ExecuteJs, Params::ExecuteJs(p)) => scripting::execute_js(&mut session_guard, &p).await?,

            (action, params) => return Err(Error::InvalidCommand(format!("Action {:?} does not support the provided parameters: {:?}", action, params))),
        };

        Ok(result)
    }
}
