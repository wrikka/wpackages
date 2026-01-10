use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput, Data, DataStruct, Fields, FieldsNamed, Attribute, Meta};

/// Getter attribute configuration
#[derive(Default)]
struct GetterConfig {
    skip: bool,
    copy: bool,
}

/// Parse getter attributes from field attributes
fn parse_getter_attrs(attrs: &[Attribute]) -> GetterConfig {
    let mut config = GetterConfig::default();

    for attr in attrs {
        if attr.path().is_ident("getter") {
            if let Meta::List(meta_list) = &attr.meta {
                for nested in meta_list.tokens.clone().into_iter() {
                    let nested_str = nested.to_string();
                    if nested_str.contains("skip") {
                        config.skip = true;
                    } else if nested_str.contains("copy") {
                        config.copy = true;
                    }
                }
            }
        }
    }

    config
}

/// Implementation of the Getters derive macro.
pub fn derive_getters_impl(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let fields = if let Data::Struct(DataStruct { fields: Fields::Named(FieldsNamed { ref named, .. }), .. }) = input.data {
        named
    } else {
        return syn::Error::new_spanned(
            &input.ident,
            "Getters derive macro only supports structs with named fields"
        ).to_compile_error().into();
    };

    let getters = fields.iter().filter_map(|f| {
        let config = parse_getter_attrs(&f.attrs);
        if config.skip {
            None
        } else {
            let name = &f.ident;
            let ty = &f.ty;
            if config.copy {
                Some(quote! {
                    pub fn #name(&self) -> #ty {
                        self.#name
                    }
                })
            } else {
                Some(quote! {
                    pub fn #name(&self) -> &#ty {
                        &self.#name
                    }
                })
            }
        }
    });

    let expanded = quote! {
        impl #name {
            #(#getters)*
        }
    };

    TokenStream::from(expanded)
}
