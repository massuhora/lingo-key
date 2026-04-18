use serde::{Deserialize, Serialize};

use crate::AppState;
use tauri::{Emitter, Manager};

fn default_main_hotkey() -> String {
    "CommandOrControl+Shift+L".to_string()
}

fn default_explain_hotkey() -> String {
    "CommandOrControl+Shift+E".to_string()
}

fn default_output_mode() -> String {
    "enhanced".to_string()
}

fn default_locale() -> String {
    "zh-CN".to_string()
}

fn default_source_language() -> String {
    "chinese".to_string()
}

fn default_target_language() -> String {
    "english".to_string()
}

fn default_settings_hotkey() -> String {
    "CommandOrControl+Shift+S".to_string()
}

fn default_always_on_top() -> bool {
    true
}

fn default_theme() -> String {
    "dark".to_string()
}

fn default_opacity() -> f64 {
    1.0
}

fn default_base_url() -> String {
    "https://api.deepseek.com".to_string()
}

fn default_model() -> String {
    "deepseek-chat".to_string()
}

fn is_supported_language(language: &str) -> bool {
    matches!(
        language,
        "chinese" | "english" | "japanese" | "korean" | "spanish" | "french" | "german"
    )
}

fn is_supported_locale(locale: &str) -> bool {
    matches!(locale, "zh-CN" | "en-US")
}

pub fn is_chinese_locale(locale: &str) -> bool {
    locale == "zh-CN"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AiProvider {
    #[serde(default = "default_base_url")]
    pub base_url: String,
    #[serde(default)]
    pub api_key: String,
    #[serde(default = "default_model")]
    pub model: String,
}

impl Default for AiProvider {
    fn default() -> Self {
        Self {
            base_url: default_base_url(),
            api_key: String::new(),
            model: default_model(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default = "default_main_hotkey")]
    pub main_hotkey: String,
    #[serde(default = "default_explain_hotkey")]
    pub explain_hotkey: String,
    #[serde(default = "default_settings_hotkey")]
    pub settings_hotkey: String,
    #[serde(default = "default_locale")]
    pub locale: String,
    #[serde(default = "default_source_language")]
    pub source_language: String,
    #[serde(default = "default_target_language")]
    pub target_language: String,
    #[serde(default = "default_output_mode")]
    pub output_mode: String,
    #[serde(default)]
    pub auto_start: bool,
    #[serde(default = "default_always_on_top")]
    pub always_on_top: bool,
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default = "default_opacity")]
    pub opacity: f64,
    #[serde(default)]
    pub ai_provider: AiProvider,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            main_hotkey: default_main_hotkey(),
            explain_hotkey: default_explain_hotkey(),
            settings_hotkey: default_settings_hotkey(),
            locale: default_locale(),
            source_language: default_source_language(),
            target_language: default_target_language(),
            output_mode: default_output_mode(),
            auto_start: false,
            always_on_top: default_always_on_top(),
            theme: default_theme(),
            opacity: default_opacity(),
            ai_provider: AiProvider::default(),
        }
    }
}

impl AppSettings {
    /// Replace empty hotkey strings with their defaults to avoid registration failures.
    pub fn sanitize(&mut self) {
        if self.main_hotkey.trim().is_empty() {
            self.main_hotkey = default_main_hotkey();
        }
        if self.explain_hotkey.trim().is_empty() {
            self.explain_hotkey = default_explain_hotkey();
        }
        if self.settings_hotkey.trim().is_empty() {
            self.settings_hotkey = default_settings_hotkey();
        }
        if !is_supported_locale(self.locale.trim()) {
            self.locale = default_locale();
        }
        if !is_supported_language(self.source_language.trim()) {
            self.source_language = default_source_language();
        }
        if !is_supported_language(self.target_language.trim()) {
            self.target_language = default_target_language();
        }
        if self.output_mode.trim().is_empty() {
            self.output_mode = default_output_mode();
        }
        if self.theme.trim().is_empty() {
            self.theme = default_theme();
        }
        if self.opacity < 0.0 || self.opacity > 1.0 || self.opacity.is_nan() {
            self.opacity = default_opacity();
        }
        if self.ai_provider.base_url.trim().is_empty() {
            self.ai_provider.base_url = default_base_url();
        }
        if self.ai_provider.model.trim().is_empty() {
            self.ai_provider.model = default_model();
        }
    }
}

#[tauri::command]
pub fn get_settings(state: tauri::State<AppState>) -> Result<AppSettings, String> {
    let settings = state.settings.lock().map_err(|e| e.to_string())?;
    Ok(settings.clone())
}

#[tauri::command]
pub async fn set_settings(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    mut settings: AppSettings,
) -> Result<AppSettings, String> {
    use tauri_plugin_autostart::ManagerExt;
    use tauri_plugin_store::StoreExt;

    // Ensure valid hotkeys before saving.
    settings.sanitize();

    // Update store
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    store
        .set("settings", serde_json::to_value(&settings).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;

    // Update autostart
    let autostart = app.autolaunch();
    if settings.auto_start {
        let _ = autostart.enable();
    } else {
        let _ = autostart.disable();
    }

    // Update alwaysOnTop for all windows
    for label in ["main", "explain", "settings"] {
        if let Some(window) = app.get_webview_window(label) {
            let _: Result<(), _> = window.set_always_on_top(settings.always_on_top);
            let _: Result<bool, _> = crate::commands::window::apply_window_opacity(&window, settings.opacity);
        }
    }

    // Update in-memory state and re-register hotkeys
    {
        let mut locked = state.settings.lock().map_err(|e| e.to_string())?;
        *locked = settings.clone();
    }

    crate::apply_tray_locale(&state, &settings.locale);

    if let Err(e) = crate::register_hotkeys(&app, &settings, &state) {
        eprintln!("Failed to re-register hotkeys: {}", e);
    }

    let _ = app.emit("settings-changed", &settings);

    Ok(settings)
}

#[tauri::command]
pub async fn reset_settings(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<AppSettings, String> {
    let defaults = AppSettings::default();
    set_settings(app, state, defaults).await
}
