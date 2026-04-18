use anyhow::Context;
use std::sync::Mutex;
use tauri::{Manager, WindowEvent};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};

mod commands;
mod cursor;
mod input;

use commands::settings::AppSettings;
use commands::window::show_explain_with_text;

pub struct AppState {
    pub settings: Mutex<AppSettings>,
    pub registered_main_hotkey: Mutex<Option<String>>,
    pub registered_explain_hotkey: Mutex<Option<String>>,
    pub registered_settings_hotkey: Mutex<Option<String>>,
}

fn setup_prevent_close(window: &tauri::WebviewWindow) {
    let w = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = w.hide();
        }
    });
}

pub fn register_hotkeys(
    app: &tauri::AppHandle,
    settings: &AppSettings,
    state: &AppState,
) -> anyhow::Result<()> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let gs = app.global_shortcut();

    // Unregister existing hotkeys.
    if let Ok(old) = state.registered_main_hotkey.lock() {
        if let Some(ref hotkey) = *old {
            let _ = gs.unregister(hotkey.as_str());
        }
    }
    if let Ok(old) = state.registered_explain_hotkey.lock() {
        if let Some(ref hotkey) = *old {
            let _ = gs.unregister(hotkey.as_str());
        }
    }
    if let Ok(old) = state.registered_settings_hotkey.lock() {
        if let Some(ref hotkey) = *old {
            let _ = gs.unregister(hotkey.as_str());
        }
    }

    // Register main hotkey.
    let main_hotkey = settings.main_hotkey.clone();
    gs.on_shortcut(main_hotkey.as_str(), move |app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            if let Some(window) = app.get_webview_window("main") {
                let state = app.state::<AppState>();
                let _ = window.unminimize();
                let _ = window.center();
                let _ = window.show();
                let _ = commands::window::apply_managed_window_preferences(&window, &state);
                let _ = window.set_focus();
            }
        }
    })
    .with_context(|| format!("failed to register main hotkey: {}", main_hotkey))?;

    // Register explain hotkey.
    let explain_hotkey = settings.explain_hotkey.clone();
    gs.on_shortcut(explain_hotkey.as_str(), move |app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            #[cfg(target_os = "windows")]
            let text = {
                let before = app.clipboard().read_text().unwrap_or_default();
                input::simulate_copy();
                let mut text = before.clone();
                for _ in 0..20 {
                    std::thread::sleep(std::time::Duration::from_millis(50));
                    let current = app.clipboard().read_text().unwrap_or_default();
                    if current != before {
                        text = current;
                        break;
                    }
                }
                text
            };
            #[cfg(not(target_os = "windows"))]
            let text = app
                .clipboard()
                .read_text()
                .unwrap_or_default();
            if let Err(e) = show_explain_with_text(app, text) {
                eprintln!("Failed to show explain window: {}", e);
            }
        }
    })
    .with_context(|| format!("failed to register explain hotkey: {}", explain_hotkey))?;

    // Register settings hotkey.
    let settings_hotkey = settings.settings_hotkey.clone();
    gs.on_shortcut(settings_hotkey.as_str(), move |app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            if let Some(window) = app.get_webview_window("settings") {
                let state = app.state::<AppState>();
                let _ = window.unminimize();
                let _ = window.center();
                let _ = window.show();
                let _ = commands::window::apply_managed_window_preferences(&window, &state);
                let _ = window.set_focus();
            }
        }
    })
    .with_context(|| format!("failed to register settings hotkey: {}", settings_hotkey))?;

    *state
        .registered_main_hotkey
        .lock()
        .unwrap() = Some(settings.main_hotkey.clone());
    *state
        .registered_explain_hotkey
        .lock()
        .unwrap() = Some(settings.explain_hotkey.clone());
    *state
        .registered_settings_hotkey
        .lock()
        .unwrap() = Some(settings.settings_hotkey.clone());

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(AppState {
            settings: Mutex::new(AppSettings::default()),
            registered_main_hotkey: Mutex::new(None),
            registered_explain_hotkey: Mutex::new(None),
            registered_settings_hotkey: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::show_main_window,
            commands::window::show_explain_window,
            commands::window::show_settings_window,
            commands::window::hide_window,
            commands::window::focus_window,
            commands::window::start_dragging,
            commands::window::set_window_opacity,
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::settings::reset_settings,
            commands::clipboard::read_clipboard,
            commands::clipboard::write_clipboard,
            commands::hotkey::update_hotkeys,
            commands::api::optimize_text,
            commands::api::explain_text,
        ])
        .setup(|app| {
            use tauri_plugin_autostart::ManagerExt;
            use tauri_plugin_store::StoreExt;

            // Load persisted settings.
            let store = app.store("settings.json")?;
            let mut settings: AppSettings = store
                .get("settings")
                .and_then(|v| serde_json::from_value(v).ok())
                .unwrap_or_default();
            
            // Ensure valid hotkeys (fallback to defaults if empty/corrupted).
            settings.sanitize();

            store.set(
                "settings",
                serde_json::to_value(&settings).context("serialize settings")?,
            );
            store.save().context("save settings store")?;

            // Apply autostart preference.
            let autostart = app.autolaunch();
            if settings.auto_start {
                let _ = autostart.enable();
            } else {
                let _ = autostart.disable();
            }

            // Apply alwaysOnTop preference.
            for label in ["main", "explain", "settings"] {
                if let Some(window) = app.get_webview_window(label) {
                    let _ = window.set_always_on_top(settings.always_on_top);
                    let _ = commands::window::apply_native_window_chrome(&window);
                    let _ = commands::window::apply_window_opacity(&window, settings.opacity);
                }
            }

            // Store settings in managed state.
            let state = app.state::<AppState>();
            *state.settings.lock().unwrap() = settings.clone();

            // Register configurable hotkeys.
            if let Err(e) = register_hotkeys(&app.handle(), &settings, &state) {
                eprintln!("Failed to register hotkeys: {}", e);
            }

            // Setup close-to-hide for all windows to prevent destruction.
            for label in ["main", "explain", "settings"] {
                if let Some(window) = app.get_webview_window(label) {
                    setup_prevent_close(&window);
                }
            }

            // Setup system tray.
            let show_i = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
            let settings_i = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &settings_i, &quit_i])?;

            TrayIconBuilder::new()
                .icon(tauri::include_image!("icons/icon.ico"))
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &tauri::AppHandle, event| {
                    match event.id.as_ref() {
                        "show" => {
                            let state = app.state::<AppState>();
                            let _ = commands::window::show_main_window(app.clone(), state);
                        }
                        "settings" => {
                            let state = app.state::<AppState>();
                            let _ = commands::window::show_settings_window(app.clone(), state);
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        let state = app.state::<AppState>();
                        let _ = commands::window::show_main_window(app.clone(), state);
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
