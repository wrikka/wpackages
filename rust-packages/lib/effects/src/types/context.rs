use std::any::{Any, TypeId};
use std::collections::HashMap;
use std::sync::Arc;

/// A typed context for dependency injection
#[derive(Clone)]
pub struct Context {
    services: Arc<HashMap<TypeId, Arc<dyn Any + Send + Sync>>>,
}

impl Context {
    /// Create a new empty context
    pub fn new() -> Self {
        Self {
            services: Arc::new(HashMap::new()),
        }
    }

    /// Add a service to the context
    pub fn add<T: Any + Send + Sync>(mut self, service: T) -> Self {
        let services = Arc::make_mut(&mut self.services);
        services.insert(TypeId::of::<T>(), Arc::new(service));
        self
    }

    /// Get a service from the context
    pub fn get<T: Any + Send + Sync>(&self) -> Option<&T> {
        self.services
            .get(&TypeId::of::<T>())
            .and_then(|s| s.as_ref().downcast_ref())
    }

    /// Get a mutable service from the context
    pub fn get_mut<T: Any + Send + Sync>(&mut self) -> Option<&mut T> {
        let services = Arc::make_mut(&mut self.services);
        let service = services.get_mut(&TypeId::of::<T>())?;
        let service = Arc::get_mut(service)?;
        service.downcast_mut()
    }

    /// Check if a service exists
    pub fn has<T: Any + Send + Sync>(&self) -> bool {
        self.services.contains_key(&TypeId::of::<T>())
    }
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_context_add_get() {
        let ctx = Context::new().add(42i32);
        assert_eq!(ctx.get::<i32>(), Some(&42));
    }

    #[test]
    fn test_context_has() {
        let ctx = Context::new().add(42i32);
        assert!(ctx.has::<i32>());
        assert!(!ctx.has::<String>());
    }

    #[test]
    fn test_context_multiple_types() {
        let ctx = Context::new().add(42i32).add("hello".to_string());
        assert_eq!(ctx.get::<i32>(), Some(&42));
        assert_eq!(ctx.get::<String>(), Some(&"hello".to_string()));
    }
}
