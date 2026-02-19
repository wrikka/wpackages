use proc_macro::TokenStream;
use proc_macro2::TokenStream as TokenStream2;
use quote::quote;
use syn::{parse_macro_input, Data, DataStruct, DeriveInput, Fields, Type};

#[proc_macro_derive(Schema, attributes(schema))]
pub fn derive_schema(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let schema_impl = match &input.data {
        Data::Struct(data_struct) => impl_struct_schema(name, data_struct),
        Data::Enum(data_enum) => impl_enum_schema(name, data_enum),
        Data::Union(_) => {
            return syn::Error::new(name.span(), "Schema derive macro does not support unions")
                .to_compile_error()
                .into();
        }
    };

    TokenStream::from(schema_impl)
}

fn impl_struct_schema(name: &syn::Ident, data_struct: &DataStruct) -> TokenStream2 {
    let fields = match &data_struct.fields {
        Fields::Named(fields) => &fields.named,
        Fields::Unnamed(_) => {
            return syn::Error::new(
                name.span(),
                "Schema derive macro only supports named fields",
            )
            .to_compile_error();
        }
        Fields::Unit => return quote! {},
    };

    let field_schemas: Vec<TokenStream2> = fields
        .iter()
        .map(|field| {
            let field_name = field.ident.as_ref().unwrap();
            let field_type = &field.ty;

            // Parse schema attributes
            let validators = parse_field_validators(&field.attrs);

            // Generate schema based on field type
            let schema = match field_type {
                Type::Path(path) => {
                    let segment = path.path.segments.last().unwrap();
                    let type_name = &segment.ident;

                    if type_name == "String" {
                        quote! { ::schema::string() }
                    } else if type_name == "i64"
                        || type_name == "i32"
                        || type_name == "u64"
                        || type_name == "u32"
                    {
                        quote! { ::schema::integer() }
                    } else if type_name == "f64" || type_name == "f32" {
                        quote! { ::schema::float() }
                    } else if type_name == "bool" {
                        quote! { ::schema::boolean() }
                    } else if type_name == "Option" {
                        // For Option<T>, we need to get the inner type
                        if let syn::PathArguments::AngleBracketed(args) = &segment.arguments {
                            if let Some(_inner) = args.args.first() {
                                quote! { ::schema::string() }
                            } else {
                                quote! { ::schema::string() }
                            }
                        } else {
                            quote! { ::schema::string() }
                        }
                    } else {
                        // Default to string for unknown types
                        quote! { ::schema::string() }
                    }
                }
                _ => quote! { ::schema::string() },
            };

            quote! {
                .field(
                    stringify!(#field_name),
                    #schema
                        #validators
                )
            }
        })
        .collect();

    let required_fields: Vec<TokenStream2> = fields
        .iter()
        .filter_map(|field| {
            let field_name = field.ident.as_ref()?;

            // Check if field is Option
            if is_option_type(&field.ty) {
                None
            } else {
                Some(quote! {
                    .required(stringify!(#field_name))
                })
            }
        })
        .collect();

    quote! {
        use ::schema::derive::SchemaDerive;
        impl SchemaDerive for #name {
            fn schema() -> ::schema::Schema {
                ::schema::object_schema()
                    #(#field_schemas)*
                    #(#required_fields)*
                    .build()
            }
        }
    }
}

fn impl_enum_schema(name: &syn::Ident, data_enum: &syn::DataEnum) -> TokenStream2 {
    let variants: Vec<TokenStream2> = data_enum
        .variants
        .iter()
        .map(|variant| {
            let variant_name = &variant.ident;
            quote! {
                stringify!(#variant_name).to_string()
            }
        })
        .collect();

    quote! {
        use ::schema::derive::SchemaDerive;
        impl SchemaDerive for #name {
            fn schema() -> ::schema::Schema {
                ::schema::string()
                    .with_validator(Box::new(::schema::components::validators::enum_validator(vec![
                        #(#variants),*
                    ])))
                    .build()
            }
        }
    }
}

fn parse_field_validators(attrs: &[syn::Attribute]) -> TokenStream2 {
    let mut validators = Vec::new();

    for attr in attrs {
        if attr.path().is_ident("schema") {
            attr.parse_nested_meta(|meta| {
                if meta.path.is_ident("min_length") {
                    let value: syn::LitInt = meta.value()?.parse()?;
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::min_length(#value as usize)))
                    });
                } else if meta.path.is_ident("max_length") {
                    let value: syn::LitInt = meta.value()?.parse()?;
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::max_length(#value as usize)))
                    });
                } else if meta.path.is_ident("min") {
                    let value: syn::LitInt = meta.value()?.parse()?;
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::min(#value)))
                    });
                } else if meta.path.is_ident("max") {
                    let value: syn::LitInt = meta.value()?.parse()?;
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::max(#value)))
                    });
                } else if meta.path.is_ident("email") {
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::email()))
                    });
                } else if meta.path.is_ident("url") {
                    validators.push(quote! {
                        .with_validator(Box::new(::schema::components::validators::url()))
                    });
                }
                Ok(())
            }).ok();
        }
    }

    quote! {
        #(#validators)*
    }
}

fn is_option_type(ty: &Type) -> bool {
    match ty {
        Type::Path(path) => {
            if let Some(segment) = path.path.segments.last() {
                segment.ident == "Option"
            } else {
                false
            }
        }
        _ => false,
    }
}
