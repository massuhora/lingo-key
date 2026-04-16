use tauri::{Emitter, Manager};

use crate::cursor::get_cursor_position;

fn ensure_window_visible(window: &tauri::WebviewWindow) -> Result<(), String> {
    if window.is_minimized().map_err(|e| e.to_string())? {
        window.unminimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("main window not found")?;
    ensure_window_visible(&window)?;
    window.center().map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn show_explain_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("explain")
        .ok_or("explain window not found")?;

    let (cursor_x, cursor_y) = get_cursor_position()?;
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("no monitor found")?;
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();

    let window_width: i32 = 360;
    let window_height: i32 = 280;
    let offset: i32 = 16;

    let mut pos_x = cursor_x + offset;
    let mut pos_y = cursor_y + offset;

    let monitor_right = monitor_pos.x + monitor_size.width as i32;
    let monitor_bottom = monitor_pos.y + monitor_size.height as i32;

    if pos_x + window_width > monitor_right {
        pos_x = cursor_x - window_width - offset;
    }
    if pos_y + window_height > monitor_bottom {
        pos_y = cursor_y - window_height - offset;
    }

    pos_x = pos_x.max(monitor_pos.x);
    pos_y = pos_y.max(monitor_pos.y);

    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: pos_x,
            y: pos_y,
        }))
        .map_err(|e| e.to_string())?;
    ensure_window_visible(&window)?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

/// Show the explain window and emit the provided text to it.
pub fn show_explain_with_text(app: &tauri::AppHandle, text: String) -> Result<(), String> {
    show_explain_window(app.clone())?;
    app.emit_to("explain", "clipboard-text", text)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn show_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or("settings window not found")?;
    ensure_window_visible(&window)?;
    window.center().map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn hide_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| format!("{} window not found", label))?;
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn focus_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| format!("{} window not found", label))?;
    window.set_focus().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn start_dragging(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| format!("{} window not found", label))?;
    window.start_dragging().map_err(|e| e.to_string())
}
