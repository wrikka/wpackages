use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

/// Implementation of the New derive macro.
pub fn derive_new_impl(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let fields = if let syn::Data::Struct(syn::DataStruct { fields: syn::Fields::Named(syn::FieldsNamed { ref named, .. }), .. }) = input.data {
        named
    } else {
        return syn::Error::new_spanned(
            &input.ident,
            "New derive macro only supports structs with named fields"
        ).to_compile_error().into();
    };

    let params = fields.iter().map(|f| {
        let name = &f.ident;
        let ty = &f.ty;
        quote! { #name: #ty }
    });

    let assignments = fields.iter().map(|f| {
        let name = &f.ident;
        quote! { #name }
    });

    let expanded = quote! {
        impl #name {
            pub fn new(#(#params),*) -> Self {
                Self {
                    #(#assignments),*
                }
            }
        }
    };

    TokenStream::from(expanded)
}
