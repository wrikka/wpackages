use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, Data, DataStruct, DeriveInput, Fields, Ident};

pub fn derive_setters_impl(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    let fields = match &input.data {
        Data::Struct(DataStruct { fields, .. }) => fields,
        _ => panic!("Setters can only be derived for structs"),
    };

    let setters = match fields {
        Fields::Named(fields) => {
            fields.named.iter().filter_map(|field| {
                let field_name = field.ident.as_ref()?;
                let field_type = &field.ty;

                let setter_name = Ident::new(
                    &format!("set_{}", field_name),
                    field_name.span()
                );

                Some(quote! {
                    pub fn #setter_name(&mut self, value: #field_type) -> &mut Self {
                        self.#field_name = value;
                        self
                    }
                })
            }).collect::<Vec<_>>()
        },
        _ => panic!("Setters can only be derived for structs with named fields"),
    };

    let expanded = quote! {
        impl #impl_generics #struct_name #ty_generics #where_clause {
            #(#setters)*
        }
    };

    TokenStream::from(expanded)
}
