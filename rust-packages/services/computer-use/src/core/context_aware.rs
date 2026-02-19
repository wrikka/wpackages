//! Context-Aware Actions (Feature 16)
//!
//! Actions that adapt based on time, location, active app, and user context

use anyhow::Result;
use chrono::{DateTime, Local, Timelike, Weekday};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Context factors for adaptive behavior
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionContext {
    pub timestamp: DateTime<Local>,
    pub timezone: String,
    pub location: Option<Location>,
    pub active_app: Option<String>,
    pub window_title: Option<String>,
    pub user_state: UserState,
    pub system_state: SystemState,
    pub previous_actions: Vec<String>,
    pub custom_data: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub timezone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserState {
    pub idle_minutes: u32,
    pub focus_mode: bool,
    pub do_not_disturb: bool,
    pub work_hours: bool,
    pub meeting_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemState {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub battery_level: Option<f32>,
    pub network_connected: bool,
    pub vpn_active: bool,
}

/// Context rule for conditional behavior
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextRule {
    pub name: String,
    pub conditions: Vec<Condition>,
    pub action_modifier: ActionModifier,
    pub priority: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Condition {
    TimeOfDay { start: String, end: String },
    DayOfWeek(Vec<Weekday>),
    ActiveApp(String),
    WindowTitleContains(String),
    UserIdleFor(u32),
    WorkHours,
    FocusMode,
    BatteryBelow(f32),
    NetworkStatus(bool),
    Custom { key: String, value: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionModifier {
    AddDelay(u64),
    ReduceSpeed(f32),
    SkipIfNotMatch,
    RequireConfirmation,
    UseAlternative(String),
    ChangeTarget { original: String, alternative: String },
    NotifyBefore,
}

/// Context-aware action planner
pub struct ContextAwarePlanner {
    rules: Vec<ContextRule>,
    context_history: Vec<ExecutionContext>,
    learning_enabled: bool,
}

impl ContextAwarePlanner {
    pub fn new() -> Self {
        Self {
            rules: Vec::new(),
            context_history: Vec::new(),
            learning_enabled: true,
        }
    }

    /// Add a context rule
    pub fn add_rule(&mut self, rule: ContextRule) {
        self.rules.push(rule);
        // Sort by priority
        self.rules.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    /// Get current execution context
    pub async fn get_current_context(&self) -> Result<ExecutionContext> {
        let now = Local::now();
        
        Ok(ExecutionContext {
            timestamp: now,
            timezone: now.offset().to_string(),
            location: None, // Would get from system
            active_app: self.get_active_app().await.ok(),
            window_title: self.get_window_title().await.ok(),
            user_state: self.get_user_state().await,
            system_state: self.get_system_state().await,
            previous_actions: vec![],
            custom_data: HashMap::new(),
        })
    }

    /// Plan action with context awareness
    pub async fn plan_action(&mut self, action: crate::types::Action) -> Result<ContextualAction> {
        let context = self.get_current_context().await?;
        self.context_history.push(context.clone());

        // Check all applicable rules
        let applicable_modifiers = self.find_applicable_modifiers(&context);

        Ok(ContextualAction {
            original_action: action,
            context,
            modifiers: applicable_modifiers,
            recommended_approach: self.recommend_approach(&context),
        })
    }

    /// Check if should execute now based on context
    pub async fn should_execute_now(&self) -> Result<bool> {
        let context = self.get_current_context().await?;

        // Don't execute during focus mode or DND
        if context.user_state.focus_mode || context.user_state.do_not_disturb {
            return Ok(false);
        }

        // Don't execute during meetings
        if context.user_state.meeting_active {
            return Ok(false);
        }

        // Check work hours if configured
        let hour = context.timestamp.hour();
        if context.user_state.work_hours && (hour < 9 || hour > 18) {
            return Ok(false);
        }

        Ok(true)
    }

    /// Get optimal execution time
    pub async fn get_optimal_time(&self) -> Result<DateTime<Local>> {
        let context = self.get_current_context().await?;
        let now = context.timestamp;

        // If currently busy, suggest next available time
        if context.user_state.meeting_active || context.user_state.focus_mode {
            // Suggest in 30 minutes
            return Ok(now + chrono::Duration::minutes(30));
        }

        // If outside work hours, suggest next work day morning
        let hour = now.hour();
        if !context.user_state.work_hours || hour < 9 {
            // Next day at 9 AM
            let tomorrow = now + chrono::Duration::days(1);
            return Ok(tomorrow.with_hour(9).unwrap_or(tomorrow));
        }

        Ok(now)
    }

    /// Adapt action speed based on system load
    pub async fn get_adaptive_delay(&self) -> Result<u64> {
        let context = self.get_current_context().await?;
        
        let base_delay = 100u64; // 100ms base
        
        // Slow down if system is busy
        let system_factor = if context.system_state.cpu_usage > 80.0 {
            3.0
        } else if context.system_state.cpu_usage > 50.0 {
            1.5
        } else {
            1.0
        };

        // Slow down if user is active
        let user_factor = if context.user_state.idle_minutes < 1 {
            2.0 // User is active, be more careful
        } else {
            1.0
        };

        Ok((base_delay as f32 * system_factor * user_factor) as u64)
    }

    /// Find applicable context modifiers
    fn find_applicable_modifiers(&self, context: &ExecutionContext) -> Vec<ActionModifier> {
        let mut modifiers = Vec::new();

        for rule in &self.rules {
            if self.check_conditions(&rule.conditions, context) {
                modifiers.push(rule.action_modifier.clone());
            }
        }

        modifiers
    }

    /// Check if conditions are met
    fn check_conditions(&self, conditions: &[Condition], context: &ExecutionContext) -> bool {
        conditions.iter().all(|c| self.check_condition(c, context))
    }

    fn check_condition(&self, condition: &Condition, context: &ExecutionContext) -> bool {
        match condition {
            Condition::TimeOfDay { start, end } => {
                let current = context.timestamp.format("%H:%M").to_string();
                current >= *start && current <= *end
            }
            Condition::DayOfWeek(days) => {
                let today = context.timestamp.weekday();
                days.contains(&today)
            }
            Condition::ActiveApp(app) => {
                context.active_app.as_ref().map(|a| a == app).unwrap_or(false)
            }
            Condition::WindowTitleContains(title) => {
                context.window_title.as_ref().map(|t| t.contains(title)).unwrap_or(false)
            }
            Condition::UserIdleFor(minutes) => {
                context.user_state.idle_minutes >= *minutes
            }
            Condition::WorkHours => context.user_state.work_hours,
            Condition::FocusMode => context.user_state.focus_mode,
            Condition::BatteryBelow(level) => {
                context.system_state.battery_level.map(|b| b < *level).unwrap_or(false)
            }
            Condition::NetworkStatus(connected) => {
                context.system_state.network_connected == *connected
            }
            Condition::Custom { key, value } => {
                context.custom_data.get(key).map(|v| v == value).unwrap_or(false)
            }
        }
    }

    fn recommend_approach(&self, context: &ExecutionContext) -> RecommendedApproach {
        if context.user_state.meeting_active {
            RecommendedApproach::Postpone
        } else if context.system_state.cpu_usage > 80.0 {
            RecommendedApproach::SlowAndCareful
        } else if context.user_state.idle_minutes > 10 {
            RecommendedApproach::Normal
        } else {
            RecommendedApproach::Fast
        }
    }

    async fn get_active_app(&self) -> Result<String> {
        // Get currently active application
        Ok(String::new())
    }

    async fn get_window_title(&self) -> Result<String> {
        // Get active window title
        Ok(String::new())
    }

    async fn get_user_state(&self) -> UserState {
        // Detect user state
        UserState {
            idle_minutes: 0,
            focus_mode: false,
            do_not_disturb: false,
            work_hours: true,
            meeting_active: false,
        }
    }

    async fn get_system_state(&self) -> SystemState {
        // Get system metrics
        SystemState {
            cpu_usage: 0.0,
            memory_usage: 0.0,
            battery_level: None,
            network_connected: true,
            vpn_active: false,
        }
    }
}

/// Context-enriched action
#[derive(Debug, Clone)]
pub struct ContextualAction {
    pub original_action: crate::types::Action,
    pub context: ExecutionContext,
    pub modifiers: Vec<ActionModifier>,
    pub recommended_approach: RecommendedApproach,
}

#[derive(Debug, Clone)]
pub enum RecommendedApproach {
    Normal,
    Fast,
    SlowAndCareful,
    Postpone,
    Skip,
}

/// Predefined context rules
pub struct ContextPresets;

impl ContextPresets {
    pub fn work_hours_only() -> ContextRule {
        ContextRule {
            name: "Work Hours Only".to_string(),
            conditions: vec![
                Condition::TimeOfDay { start: "09:00".to_string(), end: "18:00".to_string() },
                Condition::DayOfWeek(vec![Weekday::Mon, Weekday::Tue, Weekday::Wed, Weekday::Thu, Weekday::Fri]),
            ],
            action_modifier: ActionModifier::SkipIfNotMatch,
            priority: 100,
        }
    }

    pub fn avoid_meetings() -> ContextRule {
        ContextRule {
            name: "Avoid During Meetings".to_string(),
            conditions: vec![Condition::FocusMode],
            action_modifier: ActionModifier::RequireConfirmation,
            priority: 90,
        }
    }

    pub fn low_battery_mode() -> ContextRule {
        ContextRule {
            name: "Low Battery Mode".to_string(),
            conditions: vec![Condition::BatteryBelow(20.0)],
            action_modifier: ActionModifier::ReduceSpeed(0.5),
            priority: 80,
        }
    }

    pub fn user_active_pause() -> ContextRule {
        ContextRule {
            name: "Pause When User Active".to_string(),
            conditions: vec![Condition::UserIdleFor(0)],
            action_modifier: ActionModifier::AddDelay(2000),
            priority: 70,
        }
    }
}
