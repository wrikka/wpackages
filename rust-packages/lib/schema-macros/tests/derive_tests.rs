use schema_derive::Schema;

#[test]
fn test_basic_struct_derivation() {
    #[derive(Schema)]
    struct User {
        name: String,
        age: i32,
        email: String,
    }

    // This test verifies that the macro compiles successfully
    // The actual schema generation is tested in the schema crate
    let _ = User::schema();
}

#[test]
fn test_optional_fields() {
    #[derive(Schema)]
    struct User {
        name: String,
        age: Option<i32>,
        bio: Option<String>,
    }

    let _ = User::schema();
}

#[test]
fn test_validation_attributes() {
    #[derive(Schema)]
    struct User {
        #[schema(min_length = 3, max_length = 50)]
        name: String,

        #[schema(min = 18, max = 120)]
        age: i32,

        #[schema(email)]
        email: String,

        #[schema(url)]
        website: String,
    }

    let _ = User::schema();
}

#[test]
fn test_enum_derivation() {
    #[derive(Schema)]
    enum Role {
        Admin,
        User,
        Guest,
    }

    let _ = Role::schema();
}

#[test]
fn test_multiple_field_types() {
    #[derive(Schema)]
    struct Data {
        string_field: String,
        int_field: i64,
        float_field: f64,
        bool_field: bool,
        optional_string: Option<String>,
        optional_int: Option<i32>,
    }

    let _ = Data::schema();
}

#[test]
fn test_unit_struct() {
    #[derive(Schema)]
    struct Unit;

    let _ = Unit::schema();
}

#[test]
fn test_empty_struct() {
    #[derive(Schema)]
    struct Empty {}

    let _ = Empty::schema();
}

#[test]
fn test_nested_attributes() {
    #[derive(Schema)]
    struct User {
        #[schema(min_length = 5, email)]
        email: String,

        #[schema(max = 100, min = 0)]
        score: i32,
    }

    let _ = User::schema();
}

#[test]
fn test_enum_with_variants() {
    #[derive(Schema)]
    enum Status {
        Active,
        Inactive,
        Pending,
        Archived,
    }

    let _ = Status::schema();
}

#[test]
fn test_complex_validation() {
    #[derive(Schema)]
    struct Profile {
        #[schema(min_length = 2, max_length = 100)]
        username: String,

        #[schema(min = 13, max = 20)]
        age: i32,

        #[schema(email)]
        email: String,

        #[schema(url)]
        website: Option<String>,

        #[schema(min_length = 10, max_length = 500)]
        bio: Option<String>,
    }

    let _ = Profile::schema();
}
