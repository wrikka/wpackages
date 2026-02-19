use crate::error::RsuiError;
use crate::types::app::RsuiApp;
use crate::telemetry::init_subscriber;
use eframe::egui;

use crate::context::RsuiContext;
use crate::types::theme::RsuiTheme;

#[cfg(not(target_arch = "wasm32"))]
pub fn run_with<T: RsuiApp + 'static>(
    title: &str,
    make: impl FnOnce(&eframe::CreationContext<'_>) -> Result<T, eframe::Error> + 'static,
) -> eframe::Result<()> {
    init_subscriber();
    let options = eframe::NativeOptions::default();

    eframe::run_native(
        title,
        options,
        Box::new(move |cc| match make(cc) {
            Ok(mut inner) => {
                let theme = RsuiTheme::default();
                let ctx = RsuiContext::new(theme);
                inner.on_start(&ctx);
                Ok(Box::new(EframeAdapter { inner, ctx }))
            }
            Err(e) => Err(Box::new(RsuiError::Create(e.to_string()))),
        }),
    )
}

#[cfg(not(target_arch = "wasm32"))]
pub fn run<T: RsuiApp + Default + 'static>(title: &str) -> eframe::Result<()> {
    run_with(title, |_cc| Ok(T::default()))
}

#[cfg(target_arch = "wasm32")]
pub async fn run_wasm<T: RsuiApp + 'static>(
    canvas_id: &str,
    make: impl FnOnce(&eframe::CreationContext<'_>) -> Result<T, eframe::Error> + 'static,
) -> Result<(), eframe::wasm_bindgen::JsValue> {
    let web_options = eframe::WebOptions::default();
    eframe::WebRunner::new()
        .start(
            canvas_id,
            web_options,
            Box::new(move |cc| match make(cc) {
                Ok(mut inner) => {
                    let theme = RsuiTheme::default();
                    let ctx = RsuiContext::new(theme);
                    inner.on_start(&ctx);
                    Ok(Box::new(EframeAdapter { inner, ctx }))
                }
                Err(_e) => {
                    // This error handling is tricky because of the type mismatch.
                    // For now, we'll just panic on creation error in wasm.
                    panic!("Failed to create RsuiApp");
                }
            }),
        )
        .await
}

struct EframeAdapter<T: RsuiApp> {
    ctx: RsuiContext,
    inner: T,
}

impl<T: RsuiApp> eframe::App for EframeAdapter<T> {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        self.inner.update(ctx, &mut self.ctx);
    }
}
