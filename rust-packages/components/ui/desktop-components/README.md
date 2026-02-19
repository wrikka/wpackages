# rsui 🎨

## Introduction

`rsui` is a simple, opinionated component and theme layer on top of `egui` to build consistent, modern user interfaces for applications in the wterminal ecosystem. It provides a rich set of pre-built components and theming capabilities to accelerate UI development.

## Features

- 🎨 **Simple API**: Context-based API that simplifies component usage
- 🌓 **Theming**: Pre-built dark and light themes with easy switching
- 🧩 **Rich Component Set**: From basic buttons to complex data tables
- 🎯 **Icon Support**: Integrated with `egui_phosphor` for high-quality icons
- 📦 **Modular Components**: Reusable, composable UI widgets
- 🎭 **Consistent Design**: Opinionated design system for consistency

## Goal

- 🎯 Simplify egui UI development with pre-built components
- 🌓 Provide consistent theming across applications
- 🧩 Accelerate UI development with reusable components
- 🎨 Enable beautiful, modern interfaces with minimal code

## Design Principles

- 📝 **Simple API**: Intuitive, context-based component usage
- 🎨 **Opinionated**: Pre-defined design choices for consistency
- 🧩 **Composable**: Components that work well together
- 🌓 **Themeable**: Easy theme switching and customization

## Usage

### Basic Application

```rust
use rsui::{RsuiApp, context::RsuiContext};

#[derive(Default)]
struct MyApp;

impl RsuiApp for MyApp {
    fn update(&mut self, egui_ctx: &eframe::egui::Context, rsui_ctx: &mut RsuiContext) {
        eframe::egui::CentralPanel::default().show(egui_ctx, |ui| {
            ui.label("Hello from rsui!");
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run::<MyApp>("My App")
}
```

## Examples

### Button with Icon

```rust
use rsui::widgets::{button, ButtonVariant};

button(ui, rsui_ctx, "Submit", ButtonVariant::Primary, Some(egui_phosphor::regular::PAPER_PLANE_TILT));
```

## Core Concepts

### `RsuiApp` Trait

This is the main entry point for your application logic. Implement this trait on your root struct.

- `on_start(&mut self, ctx: &RsuiContext)`: Called once before the first frame.
- `update(&mut self, egui_ctx: &egui::Context, rsui_ctx: &mut RsuiContext)`: Called every frame to draw your UI.

### `RsuiContext`

The context holds shared data, most importantly the current theme. It is passed mutably to your `update` function, allowing you to switch themes dynamically.

```rust
// In your update function:
if ui.button("Switch to Light Theme").clicked() {
    rsui_ctx.theme = std::sync::Arc::new(rsui::types::theme::RsuiTheme::light());
}
```

## Component Gallery

`rsui` provides a rich set of components. All components that require theme information will take the `RsuiContext` as an argument.

### Buttons

```rust
use rsui::widgets::{button, ButtonVariant};

// Simple button
button(ui, rsui_ctx, "Click me", ButtonVariant::Primary, None);

// Button with icon
button(ui, rsui_ctx, "Submit", ButtonVariant::Primary, Some(egui_phosphor::regular::PAPER_PLANE_TILT));
```

### Inputs

- `text_input(ui, &mut value, "hint")`
- `password(ui, &mut value, "hint")`
- `textarea(ui, &mut value, "hint")`
- `checkbox(ui, &mut value, "label")`
- `slider(ui, &mut value, 0.0..=100.0, "label")`
- `switch(ui, &mut value)`
- `radio_group(ui, &mut value, &options)`
- `number_input(ui, &mut value)`

### Layout

- `card(ui, rsui_ctx, |ui| { ... })`
- `row(ui, |ui| { ... })`
- `column(ui, |ui| { ... })`
- `accordion(ui, id, "Title", |ui| { ... })`
- `sidebar(egui_ctx, rsui_ctx, "id", |ui| { ... })`
- `drawer(egui_ctx, rsui_ctx, "id", &mut open, |ui| { ... })`

### Overlays & Feedback

- `modal(egui_ctx, rsui_ctx, "Title", &mut open, |ui| { ... })`
- `toasts(egui_ctx, rsui_ctx, &mut toasts)`
- `tooltip(response, "Tooltip text")`
- `spinner(ui)`
- `progress(ui, 0.5)`
- `alert(ui, rsui_ctx, AlertKind::Info, "Title", "Description")`
- `skeleton(ui, egui::vec2(100.0, 20.0))`

### Data Display

- `pill(ui, rsui_ctx, "Label")`
- `badge(ui, "Label", &rsui_ctx.theme)`
- `avatar(ui, "RG")`
- `table(ui, "id", &columns, |header| { ... }, |body| { ... })`
- `timeline(ui, &items)`

### Navigation

- `tabs(ui, rsui_ctx, "id", vec![Tab::new(...)])`
- `breadcrumbs(ui, vec![BreadcrumbItem::new(...)])`
- `pagination(ui, &mut page, total_pages)`
- `stepper(ui, &["Step 1", "Step 2"], current_step)`
- `link(ui, "Clickable Link")`

To see all components in action, run the component explorer:

```sh
bun run --package rsui --example component_explorer
```

## License

MIT
