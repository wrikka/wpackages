//! Distributed tracing support (requires `distributed` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::Instant;

/// Distributed span context for tracing
#[derive(Debug, Clone)]
pub struct SpanContext {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: Option<String>,
    pub baggage: HashMap<String, String>,
}

impl SpanContext {
    #[cfg(feature = "distributed")]
    pub fn new(trace_id: impl Into<String>) -> Self {
        Self {
            trace_id: trace_id.into(),
            span_id: uuid::Uuid::new_v4().to_string(),
            parent_span_id: None,
            baggage: HashMap::new(),
        }
    }

    #[cfg(not(feature = "distributed"))]
    pub fn new(trace_id: impl Into<String>) -> Self {
        Self {
            trace_id: trace_id.into(),
            span_id: format!("span-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos()),
            parent_span_id: None,
            baggage: HashMap::new(),
        }
    }

    #[cfg(feature = "distributed")]
    pub fn child(&self) -> Self {
        Self {
            trace_id: self.trace_id.clone(),
            span_id: uuid::Uuid::new_v4().to_string(),
            parent_span_id: Some(self.span_id.clone()),
            baggage: self.baggage.clone(),
        }
    }

    #[cfg(not(feature = "distributed"))]
    pub fn child(&self) -> Self {
        Self {
            trace_id: self.trace_id.clone(),
            span_id: format!("span-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos()),
            parent_span_id: Some(self.span_id.clone()),
            baggage: self.baggage.clone(),
        }
    }
}

/// Span event
#[derive(Debug, Clone)]
pub struct SpanEvent {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub name: String,
    pub attributes: HashMap<String, String>,
}

/// Completed span
#[derive(Debug, Clone)]
pub struct Span {
    pub context: SpanContext,
    pub name: String,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
    pub status: SpanStatus,
    pub events: Vec<SpanEvent>,
    pub attributes: HashMap<String, String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SpanStatus {
    Ok,
    Error(String),
    Unset,
}

/// Tracer for distributed tracing
pub struct Tracer {
    spans: Arc<Mutex<Vec<Span>>>,
    exporters: Arc<Mutex<Vec<Arc<dyn SpanExporter>>>>,
}

impl std::fmt::Debug for Tracer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Tracer").finish_non_exhaustive()
    }
}

impl Default for Tracer {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait::async_trait]
pub trait SpanExporter: Send + Sync {
    async fn export(&self, span: &Span);
}

impl Tracer {
    pub fn new() -> Self {
        Self {
            spans: Arc::new(Mutex::new(Vec::new())),
            exporters: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn add_exporter(&self, exporter: Arc<dyn SpanExporter>) {
        let mut exporters = self.exporters.lock().await;
        exporters.push(exporter);
    }

    #[cfg(feature = "distributed")]
    pub fn start_span(&self, name: impl Into<String>, parent: Option<SpanContext>) -> SpanBuilder {
        let context = parent.map(|p| p.child()).unwrap_or_else(|| {
            SpanContext::new(uuid::Uuid::new_v4().to_string())
        });

        SpanBuilder {
            context,
            name: name.into(),
            attributes: HashMap::new(),
            tracer: self.spans.clone(),
            exporters: self.exporters.clone(),
        }
    }
}

pub struct SpanBuilder {
    context: SpanContext,
    name: String,
    attributes: HashMap<String, String>,
    tracer: Arc<Mutex<Vec<Span>>>,
    exporters: Arc<Mutex<Vec<Arc<dyn SpanExporter>>>>,
}

impl SpanBuilder {
    pub fn with_attribute(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.attributes.insert(key.into(), value.into());
        self
    }

    pub async fn end(self, status: SpanStatus) -> Span {
        let span = Span {
            context: self.context,
            name: self.name,
            start_time: chrono::Utc::now(),
            end_time: Some(chrono::Utc::now()),
            status,
            events: Vec::new(),
            attributes: self.attributes,
        };

        // Store span
        let mut spans = self.tracer.lock().await;
        spans.push(span.clone());
        drop(spans);

        // Export to exporters
        let exporters = self.exporters.lock().await;
        for exporter in exporters.iter() {
            exporter.export(&span).await;
        }

        span
    }
}

/// Distributed tracing extension for effects
pub trait DistributedTracingExt<T, E, R> {
    /// Add distributed tracing to effect
    fn with_distributed_tracing(self, tracer: Arc<Tracer>, span_name: impl Into<String>) -> Effect<T, E, R>;

    /// Add tracing with parent context
    fn with_tracing_context(self, tracer: Arc<Tracer>, span_name: impl Into<String>, parent: SpanContext) -> Effect<T, E, R>;
}

impl<T, E, R> DistributedTracingExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_distributed_tracing(self, tracer: Arc<Tracer>, span_name: impl Into<String>) -> Effect<T, E, R> {
        let span_name = span_name.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let tracer = tracer.clone();
            let span_name = span_name.clone();

            Box::pin(async move {
                #[cfg(feature = "distributed")]
                {
                    let span_builder = (*tracer).start_span(&span_name, None);

                    let result = effect.run(ctx).await;

                    let status = match &result {
                        Ok(_) => SpanStatus::Ok,
                        Err(e) => SpanStatus::Error(e.to_string()),
                    };

                    span_builder.end(status).await;

                    result
                }
                #[cfg(not(feature = "distributed"))]
                {
                    let _ = tracer;
                    let _ = span_name;
                    effect.run(ctx).await
                }
            })
        })
    }

    fn with_tracing_context(self, tracer: Arc<Tracer>, span_name: impl Into<String>, parent: SpanContext) -> Effect<T, E, R> {
        let span_name = span_name.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let tracer = tracer.clone();
            let span_name = span_name.clone();
            let parent = parent.clone();

            Box::pin(async move {
                #[cfg(feature = "distributed")]
                {
                    let span_builder = (*tracer).start_span(&span_name, Some(parent));

                    let result = effect.run(ctx).await;

                    let status = match &result {
                        Ok(_) => SpanStatus::Ok,
                        Err(e) => SpanStatus::Error(e.to_string()),
                    };

                    span_builder.end(status).await;

                    result
                }
                #[cfg(not(feature = "distributed"))]
                {
                    let _ = tracer;
                    let _ = span_name;
                    let _ = parent;
                    effect.run(ctx).await
                }
            })
        })
    }
}

/// Console span exporter for debugging
pub struct ConsoleSpanExporter;

#[async_trait::async_trait]
impl SpanExporter for ConsoleSpanExporter {
    async fn export(&self, span: &Span) {
        println!(
            "[TRACE] {} - {} - {:?}",
            span.context.trace_id,
            span.name,
            span.status
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_distributed_tracing() {
        let tracer = Arc::new(Tracer::new());

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .with_distributed_tracing(tracer.clone(), "test-effect");

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_span_context() {
        let parent = SpanContext::new("trace-123");
        let child = parent.child();

        assert_eq!(parent.trace_id, child.trace_id);
        assert_eq!(parent.span_id, child.parent_span_id.unwrap());
    }
}
