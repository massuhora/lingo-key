use serde::{Deserialize, Serialize};

use crate::AppState;
use tauri::{Emitter, Manager};

fn localized(locale: &str, zh: &str, en: &str) -> String {
    if is_chinese_locale(locale) {
        zh.to_string()
    } else {
        en.to_string()
    }
}

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

fn default_native_language() -> String {
    "chinese".to_string()
}

fn default_learning_language() -> String {
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
    "deepseek-v4-flash".to_string()
}

fn normalize_ai_model(base_url: &str, model: &str) -> String {
    let model = model.trim();
    if model.is_empty() {
        return default_model();
    }

    if base_url
        .trim()
        .to_ascii_lowercase()
        .contains("api.deepseek.com")
        && model == "deepseek-chat"
    {
        return default_model();
    }

    model.to_string()
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct WindowSize {
    pub width: f64,
    pub height: f64,
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

fn normalize_hotkey(hotkey: &str) -> String {
    hotkey
        .split('+')
        .map(|part| part.trim())
        .filter(|part| !part.is_empty())
        .map(|part| {
            let lower = part.to_ascii_lowercase();
            match lower.as_str() {
                "escape" => "Escape".to_string(),
                "esc" => "Esc".to_string(),
                "tab" => "Tab".to_string(),
                "space" => "Space".to_string(),
                "enter" => "Enter".to_string(),
                "return" => "Return".to_string(),
                "backspace" => "Backspace".to_string(),
                "delete" => "Delete".to_string(),
                "insert" => "Insert".to_string(),
                "home" => "Home".to_string(),
                "end" => "End".to_string(),
                "pageup" => "PageUp".to_string(),
                "pagedown" => "PageDown".to_string(),
                "arrowup" | "up" => "Up".to_string(),
                "arrowdown" | "down" => "Down".to_string(),
                "arrowleft" | "left" => "Left".to_string(),
                "arrowright" | "right" => "Right".to_string(),
                "capslock" => "CapsLock".to_string(),
                "numlock" => "NumLock".to_string(),
                "scrolllock" => "ScrollLock".to_string(),
                "printscreen" => "PrintScreen".to_string(),
                "pause" => "Pause".to_string(),
                "commandorcontrol" | "cmdorctrl" => "CommandOrControl".to_string(),
                "cmd" | "command" => "Command".to_string(),
                "ctrl" | "control" => "Ctrl".to_string(),
                "alt" | "option" => "Alt".to_string(),
                "shift" => "Shift".to_string(),
                "super" => "Super".to_string(),
                _ if matches!(
                    lower.as_str(),
                    "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10"
                        | "f11" | "f12"
                ) => lower.to_ascii_uppercase(),
                _ if part.len() == 1 => part.to_ascii_uppercase(),
                _ => {
                    let mut chars = lower.chars();
                    match chars.next() {
                        Some(first) => {
                            format!("{}{}", first.to_ascii_uppercase(), chars.as_str())
                        }
                        None => String::new(),
                    }
                }
            }
        })
        .collect::<Vec<_>>()
        .join("+")
}

fn is_modifier(part: &str) -> bool {
    matches!(
        part,
        "Command" | "Control" | "Cmd" | "Ctrl" | "Alt" | "Option" | "Shift" | "Super"
            | "CommandOrControl" | "CmdOrCtrl"
    )
}

fn is_valid_hotkey(hotkey: &str) -> bool {
    let normalized = normalize_hotkey(hotkey);
    let parts = normalized
        .split('+')
        .filter(|part| !part.trim().is_empty())
        .collect::<Vec<_>>();

    if parts.len() < 2 || !parts.iter().any(|part| is_modifier(part)) {
        return false;
    }

    let Some(key) = parts.last() else {
        return false;
    };

    if key.is_empty() || is_modifier(key) {
        return false;
    }

    let named_keys = [
        "Escape", "Esc", "Tab", "Space", "Enter", "Return", "Backspace", "Delete",
        "Insert", "Home", "End", "PageUp", "PageDown", "Up", "Down", "Left", "Right",
        "CapsLock", "NumLock", "ScrollLock", "PrintScreen", "Pause",
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
    ];

    named_keys.contains(key)
        || (key.chars().count() == 1
            && key
                .chars()
                .next()
                .is_some_and(|c| c.is_ascii_alphanumeric() || "`-=[]\\;',./".contains(c)))
}

fn validate_hotkey_settings(settings: &AppSettings) -> Result<(), String> {
    let labels = [
        ("main", "润色模式", "Polish Mode", settings.main_hotkey.as_str()),
        ("explain", "解释模式", "Explain Mode", settings.explain_hotkey.as_str()),
        ("settings", "设置模式", "Settings Mode", settings.settings_hotkey.as_str()),
    ];
    let mut seen = std::collections::HashMap::<String, (&str, &str, &str)>::new();

    for (field, zh_label, en_label, hotkey) in labels {
        if !is_valid_hotkey(hotkey) {
            return Err(if is_chinese_locale(&settings.locale) {
                format!(
                    "{}快捷键无效。请至少包含一个修饰键和一个普通按键，例如 Ctrl+Shift+L。",
                    zh_label
                )
            } else {
                format!(
                    "{} has an invalid shortcut. Use at least one modifier and one key, for example Ctrl+Shift+L.",
                    en_label
                )
            });
        }

        let normalized = normalize_hotkey(hotkey).to_ascii_lowercase();
        if let Some((_, other_zh, other_en)) = seen.get(&normalized) {
            return Err(if is_chinese_locale(&settings.locale) {
                format!(
                    "{}和{}使用了同一个快捷键。请为每个模式设置不同组合。",
                    zh_label, other_zh
                )
            } else {
                format!(
                    "{} and {} use the same shortcut. Set a different combination for each mode.",
                    en_label, other_en
                )
            });
        }

        seen.insert(normalized, (field, zh_label, en_label));
    }

    Ok(())
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
    #[serde(default = "default_native_language", alias = "sourceLanguage")]
    pub native_language: String,
    #[serde(default = "default_learning_language", alias = "targetLanguage")]
    pub learning_language: String,
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
    #[serde(default)]
    pub window_sizes: std::collections::HashMap<String, WindowSize>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            main_hotkey: default_main_hotkey(),
            explain_hotkey: default_explain_hotkey(),
            settings_hotkey: default_settings_hotkey(),
            locale: default_locale(),
            native_language: default_native_language(),
            learning_language: default_learning_language(),
            output_mode: default_output_mode(),
            auto_start: false,
            always_on_top: default_always_on_top(),
            theme: default_theme(),
            opacity: default_opacity(),
            ai_provider: AiProvider::default(),
            window_sizes: std::collections::HashMap::new(),
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
        if !is_supported_language(self.native_language.trim()) {
            self.native_language = default_native_language();
        }
        if !is_supported_language(self.learning_language.trim()) {
            self.learning_language = default_learning_language();
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
        self.ai_provider.model =
            normalize_ai_model(&self.ai_provider.base_url, &self.ai_provider.model);
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

    // Ensure valid values before saving.
    settings.sanitize();
    validate_hotkey_settings(&settings)?;

    let previous_settings = {
        let locked = state.settings.lock().map_err(|e| e.to_string())?;
        let mut previous = locked.clone();
        settings.window_sizes = previous.window_sizes.clone();
        previous.sanitize();
        previous
    };

    if let Err(e) = crate::register_hotkeys(&app, &settings, &state) {
        let message = format!(
            "{}: {}",
            localized(
                &settings.locale,
                "注册全局快捷键失败。这个组合可能已被系统或其他应用占用",
                "Failed to register global hotkeys. The shortcut may already be used by the system or another app",
            ),
            e
        );
        crate::set_hotkey_registration_error(&app, &state, Some(message.clone()));
        let _ = crate::register_hotkeys(&app, &previous_settings, &state);
        return Err(message);
    }

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

    // Update window preferences for the unified app window.
    for label in ["main"] {
        if let Some(window) = app.get_webview_window(label) {
            let _: Result<(), _> = window.set_always_on_top(settings.always_on_top);
            let _: Result<bool, _> = crate::commands::window::apply_window_opacity(&window, settings.opacity);
        }
    }

    // Update in-memory state.
    {
        *state.settings.lock().map_err(|e| e.to_string())? = settings.clone();
    }

    crate::apply_tray_locale(&state, &settings.locale);

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

#[tauri::command]
pub fn save_window_size(
    app: tauri::AppHandle,
    label: String,
    width: f64,
    height: f64,
) -> Result<(), String> {
    use tauri_plugin_store::StoreExt;
    let state = app.state::<AppState>();
    let mut settings = state.settings.lock().map_err(|e| e.to_string())?.clone();
    settings
        .window_sizes
        .insert(label.clone(), WindowSize { width, height });

    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    store
        .set("settings", serde_json::to_value(&settings).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;

    *state.settings.lock().map_err(|e| e.to_string())? = settings;
    Ok(())
}
