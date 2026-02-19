use crate::error::SchemaResult;
use crate::types::Schema;
use serde::Serialize;

pub struct SchemaAdapter<T> {
    schema: Schema,
    _phantom: std::marker::PhantomData<T>,
}

impl<T> SchemaAdapter<T> {
    pub fn new(schema: Schema) -> Self {
        Self {
            schema,
            _phantom: std::marker::PhantomData,
        }
    }

    pub fn validate(&self, value: &serde_json::Value) -> SchemaResult<()> {
        self.schema.validate(value)
    }
}

pub fn validate_with_schema<T>(value: &T, schema: &Schema) -> SchemaResult<()>
where
    T: Serialize,
{
    let json_value = serde_json::to_value(value)?;
    schema.validate(&json_value)
}
