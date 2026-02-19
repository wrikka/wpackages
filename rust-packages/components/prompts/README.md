# Prompt - Better than Clack for Rust 🦀

A powerful, feature-rich CLI prompt library for Rust that surpasses JavaScript's clack in every dimension.

## ✨ Why This Library?

| Feature | @clack/prompts | dialoguer | inquire | **prompt** (this) |
|---------|---------------|-----------|---------|-------------------|
| **Type Safety** | TS (runtime) | Partial | Partial | **Full compile-time** |
| **Async-Native** | ✅ | ❌ | ✅ | **✅ Zero-cost** |
| **Performance** | V8 overhead | Good | Good | **Native speed** |
| **Validation** | Sync only | Sync only | Sync only | **Sync + Async** |
| **Forms/Wizard** | Manual | ❌ | ❌ | **Built-in** |
| **History/Undo** | ❌ | Partial | ❌ | **Full Ctrl+Z** |
| **Keybindings** | Fixed | Fixed | Fixed | **Vim/Emacs** |
| **Auto-complete** | Basic | Basic | Basic | **Fuzzy + Path** |
| **Binary Size** | Node.js bundled | Small | Small | **Smallest** |

## 🚀 Quick Start

```rust
use prompt::{text, confirm, select, Result};

#[tokio::main]
async fn main() -> Result<()> {
    let name: String = text("What's your name?")
        .placeholder("Anonymous")
        .validate(|v| v.len() >= 2)
        .interact()
        .await?;

    let ok: bool = confirm("Continue?")
        .default(true)
        .interact()
        .await?;

    let lang = select("Favorite language?", ["Rust", "TypeScript", "Go"])
        .interact()
        .await?;

    Ok(())
}
```

## 📦 Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
prompt = { path = "../../rust-packages/prompt" }
tokio = { version = "1", features = ["full"] }
```

## 🎯 Features

### Basic Prompts

#### Text Input
```rust
let name = text("Your name:")
    .placeholder("John Doe")
    .default("Anonymous")
    .validate(|v| !v.is_empty())
    .interact()
    .await?;
```

#### Password
```rust
let pass = password("Enter password:")
    .interact()
    .await?;
```

#### Confirm
```rust
let ok = confirm("Proceed?")
    .default(true)
    .interact()
    .await?;
```

#### Select
```rust
let choice = select("Pick one:", ["A", "B", "C"])
    .default(0)
    .interact()
    .await?;
```

#### Multi-Select
```rust
let choices = multi_select("Select features:", [
    "Async", "Validation", "History"
])
.interact()
.await?;
```

#### Number
```rust
let age: f64 = number("Your age?").interact().await?;
let count: i32 = number("How many?").interact().await?;
```

#### Path
```rust
let path = path("Select file:")
    .must_exist()
    .interact()
    .await?;
```

#### Editor
```rust
let content = editor("Edit description:")
    .default("Enter description here...")
    .interact()
    .await?;
```

### Advanced Features

#### Intelligent Validation
```rust
use prompt::validation::Validators;

let email = text("Email:")
    .validate(Validators::email())
    .interact()
    .await?;

let url = text("Website:")
    .validate(Validators::url())
    .interact()
    .await?;

let username = text("Username:")
    .validate(Validators::length_range(3, 20))
    .interact()
    .await?;
```

#### Auto-Completion
```rust
use prompt::completion::{StaticCompletion, PathCompletion};

// Static options
let lang = text("Language:")
    .with_completion(StaticCompletion::new([
        "Rust", "Python", "Go", "TypeScript"
    ]))
    .interact()
    .await?;

// File path completion
let file = auto_complete("File:", PathCompletion::new())
    .await?;
```

#### Forms & Wizards
```rust
use prompt::form::{Form, Field, FieldType, Wizard};

// Simple form
let form = Form::new()
    .with_title("User Registration")
    .add_field(Field::new("name", "Name", FieldType::Text))
    .add_field(Field::new("email", "Email", FieldType::Text))
    .add_field(Field::new("age", "Age", FieldType::Number));

let data = form.interact().await?;

// Multi-step wizard
let wizard = Wizard::new()
    .add_step(/* step 1 */)
    .add_step(/* step 2 */)
    .add_step(/* step 3 */);

let result = wizard.run().await?;
```

#### Spinners & Progress
```rust
use prompt::{Spinner, ProgressBar};

// Spinner
let mut spinner = Spinner::new("Loading...");
spinner.start().await?;
// ... do work
spinner.stop("Done!").await?;

// Progress bar
let progress = ProgressBar::new(100);
for i in 0..=100 {
    progress.set_position(i).await;
}
progress.finish().await?;
```

#### Custom Keybindings
```rust
use prompt::keybind::{Keymap, KeyAction};
use crossterm::event::KeyCode;

let mut keymap = Keymap::vim(); // or Keymap::emacs()
keymap.bind(KeyCode::Char('x'), KeyModifiers::CONTROL, KeyAction::Cancel);
```

#### Themes
```rust
use prompt::Theme;

let theme = Theme::default()
    .with_colors(my_colors)
    .with_symbols(SymbolSet::ascii());

let name = text("Name:")
    .with_theme(theme)
    .interact()
    .await?;
```

### History & Undo

All prompts support full undo/redo with Ctrl+Z / Ctrl+Y:

```rust
let name = text("Name:")
    .with_history(100) // Keep last 100 entries
    .interact()
    .await?;
```

## 📚 Examples

Run examples with:

```bash
cargo run --example basic
cargo run --example wizard
cargo run --example spinner
cargo run --example autocomplete
```

## 🎨 Architecture

```
prompt/
├── error          # Error types and handling
├── theme          # Colors, symbols, styling
├── prompt         # Core prompt types (Text, Select, etc.)
├── validation     # Sync & async validators
├── history        # Undo/redo, input history
├── completion     # Auto-completion, fuzzy matching
├── spinner        # Loading states, progress bars
├── form           # Forms, wizards, multi-step flows
├── template       # Message templating
├── keybind        # Vim/Emacs keymap support
├── render         # Terminal rendering engine
└── event          # Event handling system
```

## 🔧 Platform Support

- ✅ Windows (PowerShell, CMD, Windows Terminal)
- ✅ macOS (Terminal, iTerm2, Alacritty)
- ✅ Linux (bash, zsh, fish)
- ✅ WebAssembly (WASM) - planned

## 📄 License

MIT

---

**Made with 🦀 in the Wai ecosystem**

