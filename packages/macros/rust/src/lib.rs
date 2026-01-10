//! # w-proc-macros
//!
//! A collection of useful Rust procedural macros for reducing boilerplate code.
//!
//! ## Features
//!
//! - `#[derive(Builder)]` - Automatically generate builder pattern for structs
//! - `#[derive(Getters)]` - Automatically generate getter methods for struct fields
//! - `#[derive(New)]` - Automatically generate `new()` constructor for structs

extern crate proc_macro;

use proc_macro::TokenStream;

mod builder;
mod getters;
mod new;
mod setters;

/// Derive macro to automatically implement the builder pattern for structs.
///
/// This macro generates a builder struct with setter methods for each field
/// and a `build()` method to construct the original struct.
///
/// # Example
///
/// ```rust
/// use w_proc_macros::Builder;
///
/// #[derive(Builder)]
/// struct MyStruct {
///     name: String,
///     age: u32,
/// }
///
/// let instance = MyStruct::builder()
///     .name("Alice".to_string())
///     .age(30)
///     .build()?;
/// ```
#[proc_macro_derive(Builder)]
pub fn derive_builder(input: TokenStream) -> TokenStream {
    builder::derive_builder_impl(input)
}

/// Derive macro to automatically generate getter methods for struct fields.
///
/// This macro generates a public getter method for each field that returns
/// an immutable reference to the field.
///
/// # Example
///
/// ```rust
/// use w_proc_macros::Getters;
///
/// #[derive(Getters)]
/// struct MyStruct {
///     name: String,
///     age: u32,
/// }
///
/// let instance = MyStruct {
///     name: "Alice".to_string(),
///     age: 30,
/// };
///
/// let name = instance.name(); // &String
/// let age = instance.age();   // &u32
/// ```
#[proc_macro_derive(Getters)]
pub fn derive_getters(input: TokenStream) -> TokenStream {
    getters::derive_getters_impl(input)
}

/// Derive macro to automatically generate a `new()` constructor for structs.
///
/// This macro generates a `new()` method that takes all fields as parameters
/// and returns a new instance of the struct.
///
/// # Example
///
/// ```rust
/// use w_proc_macros::New;
///
/// #[derive(New)]
/// struct MyStruct {
///     name: String,
///     age: u32,
/// }
///
/// let instance = MyStruct::new("Alice".to_string(), 30);
/// ```
#[proc_macro_derive(New)]
pub fn derive_new(input: TokenStream) -> TokenStream {
    new::derive_new_impl(input)
}

/// Derive macro to automatically generate setter methods for struct fields.
///
/// This macro generates a public setter method for each field that allows
/// mutable updates to the field values.
///
/// # Example
///
/// ```rust
/// use w_proc_macros::Setters;
///
/// #[derive(Setters)]
/// struct MyStruct {
///     name: String,
///     age: u32,
/// }
///
/// let mut instance = MyStruct {
///     name: "Alice".to_string(),
///     age: 30,
/// };
///
/// instance.set_name("Bob".to_string());
/// instance.set_age(31);
/// ```
#[proc_macro_derive(Setters)]
pub fn derive_setters(input: TokenStream) -> TokenStream {
    setters::derive_setters_impl(input)
}
