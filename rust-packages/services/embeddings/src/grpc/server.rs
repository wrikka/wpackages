use crate::services::EmbeddingsService;
use std::sync::Arc;
use tonic::{transport::Server, Request, Response, Status};

pub mod embeddings_grpc {
    tonic::include_proto!("embeddings");
}

use embeddings_grpc::embeddings_service_server::{EmbeddingsService as GrpcEmbeddingsService, EmbeddingsServiceServer};
use embeddings_grpc::{EmbedTextRequest, EmbedTextResponse, Embedding};

/// The gRPC server implementation.
pub struct GrpcServer {
    service: Arc<EmbeddingsService>,
}

impl GrpcServer {
    /// Creates a new GrpcServer.
    pub fn new(service: Arc<EmbeddingsService>) -> Self {
        Self { service }
    }
}

#[tonic::async_trait]
impl GrpcEmbeddingsService for GrpcServer {
    async fn embed_text(&self, request: Request<EmbedTextRequest>) -> Result<Response<EmbedTextResponse>, Status> {
        let texts = request.into_inner().texts;
        let embeddings = self.service.embed_text_batch(texts).await.map_err(|e| {
            Status::internal(format!("Failed to generate embeddings: {}", e))
        })?;

        let response = EmbedTextResponse {
            embeddings: embeddings
                .into_iter()
                .map(|e| Embedding { values: e })
                .collect(),
        };

        Ok(Response::new(response))
    }
}

/// Starts the gRPC server.
pub async fn run_grpc_server(service: Arc<EmbeddingsService>, addr: &str) -> Result<(), Box<dyn std::error::Error>> {
    let addr = addr.parse()?;
    let grpc_service = GrpcServer::new(service);

    println!("gRPC server listening on {}", addr);

    Server::builder()
        .add_service(EmbeddingsServiceServer::new(grpc_service))
        .serve(addr)
        .await?;

    Ok(())
}
