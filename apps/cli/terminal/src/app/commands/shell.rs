use crate::services::shell_enhancements::*;

#[tauri::command]
pub async fn add_trigger(trigger_json: String) -> Result<(), String> {
    let trigger: Trigger = serde_json::from_str(&trigger_json).map_err(|e| e.to_string())?;
    let system = TriggerSystem::new();
    system.add_trigger(trigger).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_trigger(trigger_id: String) -> Result<(), String> {
    let id = uuid::Uuid::parse_str(&trigger_id).map_err(|e| e.to_string())?;
    let system = TriggerSystem::new();
    system.remove_trigger(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_triggers() -> Result<Vec<Trigger>, String> {
    let system = TriggerSystem::new();
    Ok(system.get_triggers())
}

#[tauri::command]
pub async fn enable_trigger(trigger_id: String) -> Result<(), String> {
    let id = uuid::Uuid::parse_str(&trigger_id).map_err(|e| e.to_string())?;
    let system = TriggerSystem::new();
    system.enable_trigger(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn disable_trigger(trigger_id: String) -> Result<(), String> {
    let id = uuid::Uuid::parse_str(&trigger_id).map_err(|e| e.to_string())?;
    let system = TriggerSystem::new();
    system.disable_trigger(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn evaluate_triggers(text: String) -> Result<Vec<TriggerAction>, String> {
    let system = TriggerSystem::new();
    Ok(system.evaluate(&text))
}

#[tauri::command]
pub async fn add_badge(badge_json: String) -> Result<(), String> {
    let badge: Badge = serde_json::from_str(&badge_json).map_err(|e| e.to_string())?;
    let system = BadgeSystem::new();
    system.add_badge(badge);
    Ok(())
}

#[tauri::command]
pub async fn remove_badge(badge_id: String) -> Result<(), String> {
    let system = BadgeSystem::new();
    system.remove_badge(&badge_id);
    Ok(())
}

#[tauri::command]
pub async fn activate_badge(badge_id: String, value: String) -> Result<(), String> {
    let system = BadgeSystem::new();
    system.activate_badge(&badge_id, value);
    Ok(())
}

#[tauri::command]
pub async fn deactivate_badge(badge_id: String) -> Result<(), String> {
    let system = BadgeSystem::new();
    system.deactivate_badge(&badge_id);
    Ok(())
}

#[tauri::command]
pub async fn get_active_badges() -> Result<Vec<Badge>, String> {
    let system = BadgeSystem::new();
    Ok(system.get_active_badges())
}

#[tauri::command]
pub async fn get_all_badges() -> Result<Vec<Badge>, String> {
    let system = BadgeSystem::new();
    Ok(system.get_all_badges())
}

#[tauri::command]
pub async fn add_prompt_template(template_json: String) -> Result<(), String> {
    let template: PromptTemplate =
        serde_json::from_str(&template_json).map_err(|e| e.to_string())?;
    let generator = PromptGenerator::new();
    generator.add_template(template);
    Ok(())
}

#[tauri::command]
pub async fn remove_prompt_template(template_id: String) -> Result<(), String> {
    let id = uuid::Uuid::parse_str(&template_id).map_err(|e| e.to_string())?;
    let generator = PromptGenerator::new();
    generator.remove_template(id);
    Ok(())
}

#[tauri::command]
pub async fn get_prompt_templates() -> Result<Vec<PromptTemplate>, String> {
    let generator = PromptGenerator::new();
    Ok(generator.get_templates())
}

#[tauri::command]
pub async fn generate_prompt(template_id: String, context_json: String) -> Result<String, String> {
    let generator = PromptGenerator::new();
    let id = uuid::Uuid::parse_str(&template_id).map_err(|e| e.to_string())?;
    let context: std::collections::HashMap<String, String> =
        serde_json::from_str(&context_json).map_err(|e| e.to_string())?;
    generator.generate(id, &context).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_default_prompt(
    shell_type_json: String,
    context_json: String,
) -> Result<String, String> {
    let generator = PromptGenerator::new();
    let shell_type: crate::types::ShellType =
        serde_json::from_str(&shell_type_json).map_err(|e| e.to_string())?;
    let context: std::collections::HashMap<String, String> =
        serde_json::from_str(&context_json).map_err(|e| e.to_string())?;
    generator
        .generate_default(shell_type, &context)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_prompt_variable(name: String, value: String) -> Result<(), String> {
    let generator = PromptGenerator::new();
    generator.set_variable(name, value);
    Ok(())
}

#[tauri::command]
pub async fn get_prompt_variable(name: String) -> Result<Option<String>, String> {
    let generator = PromptGenerator::new();
    Ok(generator.get_variable(&name))
}
