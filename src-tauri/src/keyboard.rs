use device_query::{DeviceQuery, DeviceState, Keycode};
use std::sync::mpsc::Receiver;
use std::sync::{Arc, Mutex};
use std::thread::{self};
use std::time::Instant;

pub fn listen_keyboard() -> Arc<Mutex<Receiver<bool>>> {
    let (tx, rx) = std::sync::mpsc::channel();
    let shared_rx = Arc::new(Mutex::new(rx));
    thread::spawn(move || {
        let device_state = DeviceState::new();
        let mut ctrl_c_pressed = false;
        let mut last_pressed = Instant::now();
        let mut first_press_detected = false;

        loop {
            let keys: Vec<Keycode> = device_state.get_keys();

            if (keys.contains(&Keycode::LControl) || keys.contains(&Keycode::RControl))
                && keys.contains(&Keycode::C)
            {
                if !ctrl_c_pressed {
                    ctrl_c_pressed = true;
                    if first_press_detected && last_pressed.elapsed().as_secs() < 1 {
                        println!("Ctrl+C pressed twice within a second.");
                        tx.send(true).unwrap();
                        first_press_detected = false;
                    } else {
                        first_press_detected = true;
                        last_pressed = Instant::now();
                    }
                }
            } else {
                ctrl_c_pressed = false;
            }

            thread::sleep(std::time::Duration::from_millis(50));
        }
    });
    shared_rx
}
