use crate::components::validators::ArraySchema;
use crate::types::Schema;

/// Trait สำหรับ derive macro สำหรับ auto-generate schemas
pub trait SchemaDerive {
    fn schema() -> Schema;
}

/// Schema trait สำหรับ types ที่สามารถ generate schema ได้
pub trait Schemaable {
    fn schema() -> Schema;
}

// Implement Schemaable สำหรับ basic types
impl Schemaable for String {
    fn schema() -> Schema {
        crate::string()
    }
}

impl Schemaable for i64 {
    fn schema() -> Schema {
        crate::integer()
    }
}

impl Schemaable for i32 {
    fn schema() -> Schema {
        crate::integer()
    }
}

impl Schemaable for u64 {
    fn schema() -> Schema {
        crate::integer()
    }
}

impl Schemaable for u32 {
    fn schema() -> Schema {
        crate::integer()
    }
}

impl Schemaable for f64 {
    fn schema() -> Schema {
        crate::float()
    }
}

impl Schemaable for f32 {
    fn schema() -> Schema {
        crate::float()
    }
}

impl Schemaable for bool {
    fn schema() -> Schema {
        crate::boolean()
    }
}

impl<T: Schemaable> Schemaable for Vec<T> {
    fn schema() -> Schema {
        crate::array().items(T::schema())
    }
}

impl<T: Schemaable> Schemaable for Option<T> {
    fn schema() -> Schema {
        T::schema()
    }
}
