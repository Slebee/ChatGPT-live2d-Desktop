// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mouse_position::mouse_position::Mouse;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};
mod keyboard;
mod tray;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Position {
    x: i32,
    y: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct KeyBoardPayload {
    position: Position,
}

#[tauri::command]
fn set_shadow<R: Runtime>(app: AppHandle<R>, label: &str) {
    let window = app.get_window(label).unwrap();
    #[cfg(any(windows, target_os = "macos"))]
    window_shadows::set_shadow(&window, true).unwrap();
}

fn main() {
    let keyboard_rx = keyboard::listen_keyboard();
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        // .menu(tauri::Menu::os_default(&context.package_info().name))
        .system_tray(tray::menu()) // ✅ 将 `tauri.conf.json` 上配置的图标添加到系统托盘
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            tray::handler(app, &event)
        })
        .invoke_handler(tauri::generate_handler![set_shadow,])
        // .setup(setup::apply_blur)
        .setup(move |app| {
            let shared_rx = keyboard_rx.clone();
            let window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                loop {
                    let received = {
                        let rx = shared_rx.lock().unwrap();
                        rx.recv()
                    };
                    if let Ok(true) = received {
                        let position = Mouse::get_mouse_position();
                        match position {
                            Mouse::Position { x, y } => {
                                window
                                    .emit(
                                        "ctrl_c_pressed_twice",
                                        KeyBoardPayload {
                                            position: Position {
                                                x: x as i32,
                                                y: y as i32,
                                            },
                                        },
                                    )
                                    .unwrap();
                            }
                            Mouse::Error => println!("Error getting mouse position"),
                        }
                    }
                }
            });
            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");
}
