// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};

mod commands;
mod tray;
// mod poe_client;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Position {
    x: i32,
    y: i32,
}

#[tauri::command]
fn set_shadow<R: Runtime>(app: AppHandle<R>, label: &str) {
    let window = app.get_window(label).unwrap();
    #[cfg(any(windows, target_os = "macos"))]
    window_shadows::set_shadow(&window, true).unwrap();
}
fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .system_tray(tray::menu())
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            tray::handler(app, &event)
        })
        .invoke_handler(tauri::generate_handler![
            set_shadow,
            commands::show_in_folder
        ])
        .run(context)
        .expect("error while running tauri application");
}
