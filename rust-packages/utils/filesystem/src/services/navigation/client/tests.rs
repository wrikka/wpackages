//! Tests for navigation client.
//!
//! This module contains unit tests for the navigation client functionality.

use crate::navigation::client::factory::create_navigation_client;
use crate::navigation::client::trait::NavigationClient;
use lsp_types::{Position, Range, Url};

#[tokio::test]
async fn test_navigation_client() {
    let client = create_navigation_client();

    let uri = Url::parse("file:///test.rs").unwrap();
    let position = Position::new(0, 0);

    // Test navigation
    let result = client.goto_definition(uri, position).await;
    assert!(result.is_ok());

    // Test history
    let target = NavigationTarget::new(uri.clone(), Range::new(position, Position::new(0, 10)));
    client.navigate_to(target).await.unwrap();

    let history = client.get_history().await.unwrap();
    assert_eq!(history.len(), 1);

    // Test bookmarks
    client
        .add_bookmark("test".to_string(), target)
        .await
        .unwrap();
    let bookmarks = client.get_bookmarks().await.unwrap();
    assert_eq!(bookmarks.count(), 1);

    let removed = client.remove_bookmark("test".to_string()).await.unwrap();
    assert!(removed.is_some());
}
