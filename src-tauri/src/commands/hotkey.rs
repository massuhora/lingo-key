use crate::AppState;

/// Update hotkeys explicitly from the frontend (e.g. after settings change).
#[tauri::command]
pub fn update_hotkeys(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> Result<(), String> {
    let settings = state.settings.lock().map_err(|e| e.to_string())?.clone();
    crate::register_hotkeys(&app, &settings, &state).map_err(|e| e.to_string())
}
