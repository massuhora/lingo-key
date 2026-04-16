use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub fn read_clipboard(app: tauri::AppHandle) -> Result<String, String> {
    app.clipboard().read_text().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_clipboard(app: tauri::AppHandle, text: String) -> Result<(), String> {
    app.clipboard().write_text(text).map_err(|e| e.to_string())
}
