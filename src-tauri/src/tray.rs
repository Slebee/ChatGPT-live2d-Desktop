use tauri::{
    api::dialog::blocking::message, AppHandle, CustomMenuItem, Manager, SystemTray,
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

// create system tray menu
pub fn menu() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        // .add_submenu(SystemTraySubmenu::new(
        //     "File",
        //     SystemTrayMenu::new()
        //         .add_item(CustomMenuItem::new("new_file".to_string(), "New File"))
        //         .add_item(CustomMenuItem::new("edit_file".to_string(), "Edit File")),
        // ))
        // .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new(
            "alway_on_top".to_string(),
            "Model always on top",
        ))
        .add_item(CustomMenuItem::new(
            "cancel_alway_on_top".to_string(),
            "Cancel model always on top",
        )) // hide window
        .add_native_item(SystemTrayMenuItem::Separator) // Separator
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));

    // right click menu
    SystemTray::new().with_menu(tray_menu)
}

// system tray event handler
pub fn handler(app: &AppHandle, event: &SystemTrayEvent) {
    // get window
    let window = app.get_window("chat").unwrap();
    let live2d_window = app.get_window("live2d");
    let parent_window = Some(&window);

    // match event
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a left click");
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click");
        }
        // double click, macOS and linux not support
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        // menu item click
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "edit_file" => {
                message(parent_window, "Eidt File", "TODO");
            }
            "alway_on_top" => {
                if live2d_window.is_some() {
                    live2d_window.unwrap().set_always_on_top(true).unwrap();
                    let item_handle = app.tray_handle().get_item(&id);
                    item_handle.set_selected(true).unwrap();
                    item_handle.set_enabled(false).unwrap();
                    let item_handle = app.tray_handle().get_item("cancel_alway_on_top");
                    item_handle.set_enabled(true).unwrap();
                    item_handle.set_selected(false).unwrap();
                }
            }
            "cancel_alway_on_top" => {
                if live2d_window.is_some() {
                    live2d_window.unwrap().set_always_on_top(false).unwrap();
                    let item_handle = app.tray_handle().get_item(&id);
                    item_handle.set_selected(true).unwrap();
                    item_handle.set_enabled(false).unwrap();
                    let item_handle = app.tray_handle().get_item("alway_on_top");
                    item_handle.set_enabled(true).unwrap();
                    item_handle.set_selected(false).unwrap();
                }
            }
            "quit" => {
                app.exit(0);
                // std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}
