use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput, Data, DataStruct, Fields, FieldsNamed, Attribute, Meta, Type};

/// Builder attribute configuration
#[derive(Default)]
struct BuilderConfig {
    skip: bool,
    default: Option<String>,
    is_optional: bool,
}

/// Check if a type is Option<T>
fn is_option_type(ty: &Type) -> bool {
    if let Type::Path(type_path) = ty {
        if let Some(path_segment) = type_path.path.segments.last() {
            return path_segment.ident == "Option";
        }
    }
    false
}

/// Parse builder attributes from field attributes
fn parse_builder_attrs(attrs: &[Attribute], ty: &Type) -> BuilderConfig {
    let mut config = BuilderConfig::default();
    config.is_optional = is_option_type(ty);

    for attr in attrs {
        if attr.path().is_ident("builder") {
            if let Meta::List(meta_list) = &attr.meta {
                for nested in meta_list.tokens.clone().into_iter() {
                    let nested_str = nested.to_string();
                    if nested_str.contains("skip") {
                        config.skip = true;
                    } else if nested_str.contains("default") {
                        if let Some(default_val) = nested_str.split('=').nth(1) {
                            config.default = Some(default_val.trim_matches('"').to_string());
                        }
                    }
                }
            }
        }
    }

    config
}

/// Implementation of the Builder derive macro.
pub fn derive_builder_impl(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let builder_name = format!("{}Builder", name);
    let builder_ident = syn::Ident::new(&builder_name, name.span());

    let fields = if let Data::Struct(DataStruct { fields: Fields::Named(FieldsNamed { ref named, .. }), .. }) = input.data {
        named
    } else {
        return syn::Error::new_spanned(
            &input.ident,
            "Builder derive macro only supports structs with named fields"
        ).to_compile_error().into();
    };

    let builder_fields = fields.iter().filter_map(|f| {
        let config = parse_builder_attrs(&f.attrs, &f.ty);
        if config.skip {
            None
        } else {
            let name = &f.ident;
            let ty = &f.ty;
            Some(quote! { #name: std::option::Option<#ty> })
        }
    });

    let builder_methods = fields.iter().filter_map(|f| {
        let config = parse_builder_attrs(&f.attrs, &f.ty);
        if config.skip {
            None
        } else {
            let name = &f.ident;
            let ty = &f.ty;
            Some(quote! {
                pub fn #name(&mut self, #name: #ty) -> &mut Self {
                    self.#name = Some(#name);
                    self
                }
            })
        }
    });

    let builder_build_fields = fields.iter().filter_map(|f| {
        let config = parse_builder_attrs(&f.attrs, &f.ty);
        if config.skip {
            None
        } else if config.is_optional {
            // Optional fields default to None
            let name = &f.ident;
            Some(quote! {
                #name: self.#name.take().unwrap_or_default()
            })
        } else if let Some(default_val) = config.default {
            let name = &f.ident;
            Some(quote! {
                #name: self.#name.take().unwrap_or_else(|| #default_val)
            })
        } else {
            let name = &f.ident;
            Some(quote! {
                #name: self.#name.take().ok_or_else(|| format!("{} is not set", stringify!(#name)))?
            })
        }
    });

    let builder_init_fields = fields.iter().filter_map(|f| {
        let config = parse_builder_attrs(&f.attrs, &f.ty);
        if config.skip {
            None
        } else {
            let name = &f.ident;
            Some(quote! { #name: None })
        }
    });

    let expanded = quote! {
        pub struct #builder_ident {
            #(#builder_fields,)*
        }

        impl #name {
            pub fn builder() -> #builder_ident {
                #builder_ident {
                    #(#builder_init_fields,)*
                }
            }
        }

        impl #builder_ident {
            #(#builder_methods)*

            pub fn build(&mut self) -> std::result::Result<#name, std::boxed::Box<dyn std::error::Error>> {
                Ok(#name {
                    #(#builder_build_fields,)*
                })
            }
        }
    };

    TokenStream::from(expanded)
}
