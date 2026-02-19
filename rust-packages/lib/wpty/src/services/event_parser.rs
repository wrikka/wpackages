use crate::services::sixel_handler::SixelHandler;
use crate::types::{Hyperlink, ShellIntegrationCommand, ShellIntegrationEvent};
use vte::{Params, Perform};

pub struct PtyEventParser {
    pub on_title_change: Box<dyn Fn(String) + Send>,
    pub on_hyperlink: Box<dyn Fn(Hyperlink) + Send>,
    pub on_shell_event: Box<dyn Fn(ShellIntegrationEvent) + Send>,
    sixel_handler: SixelHandler,
}

impl PtyEventParser {
    pub fn new(
        on_title_change: Box<dyn Fn(String) + Send>,
        on_hyperlink: Box<dyn Fn(Hyperlink) + Send>,
        on_shell_event: Box<dyn Fn(ShellIntegrationEvent) + Send>,
        on_sixel: Box<dyn Fn(Vec<u8>) + Send>,
    ) -> Self {
        Self {
            on_title_change,
            on_hyperlink,
            on_shell_event,
            sixel_handler: SixelHandler::new(on_sixel),
        }
    }
}

impl Perform for PtyEventParser {
    fn osc_dispatch(&mut self, params: &[&[u8]], _bell_terminated: bool) {
        if let Some(param) = params.first() {
            let mut iter = param.splitn(2, |&b| b == b';');
            if let Some(code) = iter.next() {
                if code == b"8" {
                    // Hyperlink
                    let params = iter.next().unwrap_or_default();
                    let uri = if params.is_empty() {
                        // Empty params means end of link
                        String::new()
                    } else {
                        // Extract URI
                        let mut parts = params.splitn(2, |&b| b == b':');
                        let _ = parts.next(); // Skip params like id=, etc.
                        std::str::from_utf8(parts.next().unwrap_or_default())
                            .unwrap_or_default()
                            .to_string()
                    };
                    (self.on_hyperlink)(Hyperlink { uri });
                } else if code == b"133" {
                    // Shell Integration
                    let command_str = iter.next().unwrap_or_default();
                    let event = if command_str.starts_with(b"P;Cwd=") {
                        let cwd_bytes = &command_str[b"P;Cwd=".len()..];
                        if let Ok(cwd) = std::str::from_utf8(cwd_bytes) {
                            Some(ShellIntegrationEvent {
                                command: ShellIntegrationCommand::Cwd,
                                cwd: Some(cwd.to_string()),
                            })
                        } else {
                            None
                        }
                    } else {
                        match command_str {
                            b"A" => Some(ShellIntegrationEvent {
                                command: ShellIntegrationCommand::Prompt,
                                cwd: None,
                            }),
                            b"B" => Some(ShellIntegrationEvent {
                                command: ShellIntegrationCommand::CommandStart,
                                cwd: None,
                            }),
                            b"C" => Some(ShellIntegrationEvent {
                                command: ShellIntegrationCommand::CommandEnd,
                                cwd: None,
                            }),
                            _ => None,
                        }
                    };
                    if let Some(event) = event {
                        (self.on_shell_event)(event);
                    }
                } else if code == b"2" || code == b"0" {
                    // Title
                    if let Some(title_bytes) = iter.next() {
                        if let Ok(title) = std::str::from_utf8(title_bytes) {
                            (self.on_title_change)(title.to_string());
                        }
                    }
                }
            }
        }
    }

    fn print(&mut self, _c: char) {}
    fn execute(&mut self, _byte: u8) {}
    fn hook(&mut self, _params: &Params, _intermediates: &[u8], _ignore: bool, c: char) {
        if c == 'q' {
            self.sixel_handler.hook();
        }
    }

    fn put(&mut self, byte: u8) {
        self.sixel_handler.put(byte);
    }

    fn unhook(&mut self) {
        self.sixel_handler.unhook();
    }
    fn csi_dispatch(&mut self, _params: &Params, _intermediates: &[u8], _ignore: bool, _c: char) {}
    fn esc_dispatch(&mut self, _intermediates: &[u8], _ignore: bool, _byte: u8) {}
}
