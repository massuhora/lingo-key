use crate::AppState;

/// Update hotkeys explicitly from the frontend (e.g. after settings change).
#[tauri::command]
pub fn update_hotkeys(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> Result<(), String> {
    let settings = state.settings.lock().map_err(|e| e.to_string())?.clone();
    crate::register_hotkeys(&app, &settings, &state).map_err(|e| {
        let message = e.to_string();
        crate::set_hotkey_registration_error(&app, &state, Some(message.clone()));
        message
    })
}

#[tauri::command]
pub fn get_hotkey_registration_error(
    state: tauri::State<AppState>,
) -> Result<Option<String>, String> {
    state
        .hotkey_registration_error
        .lock()
        .map(|value| value.clone())
        .map_err(|e| e.to_string())
}
