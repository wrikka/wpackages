use anyhow::Result;

pub struct RemoteDevelopmentService;

impl RemoteDevelopmentService {
    pub async fn connect<A: tokio::net::ToSocketAddrs>(
        _addrs: A,
        _user: &str,
        _key_path: &str,
    ) -> Result<Self> {
        // Stub implementation - russh API has compatibility issues
        Ok(Self)
    }

    pub async fn read_remote_file(&mut self, _path: &str) -> Result<Vec<u8>> {
        // Stub implementation - russh API has compatibility issues
        Ok(Vec::new())
    }
}
