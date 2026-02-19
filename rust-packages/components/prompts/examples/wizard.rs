use prompt::{form::{Field, FieldType, Form, Wizard, WizardStep}, Result, Theme};

#[tokio::main]
async fn main() -> Result<()> {
    println!("🧙 Form & Wizard Demo\n");

    // Simple form demo
    let form = Form::new()
        .with_title("User Registration")
        .with_description("Please fill in your details")
        .add_field(
            Field::new("name", "Full Name", FieldType::Text)
                .with_placeholder("John Doe")
                .with_validator(prompt::validation::Validators::non_empty()),
        )
        .add_field(
            Field::new("email", "Email Address", FieldType::Text)
                .with_placeholder("john@example.com")
                .with_validator(prompt::validation::Validators::email()),
        )
        .add_field(
            Field::new("age", "Age", FieldType::Number)
                .with_default("25"),
        )
        .add_field(
            Field::new(
                "newsletter",
                "Subscribe to newsletter?",
                FieldType::Confirm,
            )
            .optional(),
        );

    println!("=== Simple Form ===");
    let data = form.interact().await?;
    println!("\n📋 Form Results:");
    for (key, value) in &data {
        println!("  {}: {}", key, value);
    }

    // Wizard demo
    println!("\n=== Multi-Step Wizard ===");

    let wizard = Wizard::new()
        .with_theme(Theme::default())
        .add_step(WizardStep::new(
            "Project Setup",
            Form::new()
                .with_title("Step 1: Project Info")
                .add_field(
                    Field::new("project_name", "Project Name", FieldType::Text)
                        .with_placeholder("my-awesome-app"),
                )
                .add_field(
                    Field::new(
                        "project_type",
                        "Project Type",
                        FieldType::Select(vec![
                            "Library".to_string(),
                            "Application".to_string(),
                            "CLI Tool".to_string(),
                        ]),
                    ),
                ),
        ))
        .add_step(
            WizardStep::new(
                "Configuration",
                Form::new()
                    .with_title("Step 2: Configuration")
                    .add_field(
                        Field::new(
                            "include_tests",
                            "Include test files?",
                            FieldType::Confirm,
                        )
                        .with_default("true"),
                    )
                    .add_field(
                        Field::new(
                            "license",
                            "License",
                            FieldType::Select(vec![
                                "MIT".to_string(),
                                "Apache-2.0".to_string(),
                                "GPL-3.0".to_string(),
                            ]),
                        ),
                    ),
            )
            .on_complete(|data| {
                println!("  ✓ Step 2 complete: {:?}", data.get("license"));
            }),
        )
        .add_step(WizardStep::new(
            "Review",
            Form::new()
                .with_title("Step 3: Review")
                .add_field(
                    Field::new(
                        "confirm",
                        "Create project with these settings?",
                        FieldType::Confirm,
                    )
                    .with_default("true"),
                ),
        ));

    let wizard_data = wizard.run().await?;
    println!("\n📊 Wizard Results:");
    for (key, value) in &wizard_data {
        println!("  {}: {}", key, value);
    }

    println!("\n✨ Demo complete!");
    Ok(())
}
