use std::io::Write;
use std::process::Stdio;
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::time::timeout;

#[derive(serde::Deserialize)]
pub struct ContinueCallback {
    continue_choice: String,
}

#[derive(serde::Deserialize)]
pub struct MoeGoeConfig {
    pub vits_model_path: String,
    pub config_file_path: String,
    pub mode: String,
    pub text_to_read: String,
    pub id: String,
    pub save_path: String,
    pub continue_callback: ContinueCallback,
}
pub fn run_moe_goe() {
    let mut cmd = Command::new("python");
    cmd.arg("G:/Github/wafu/CyberWaifu.py");
    // let mut moe_goe = Command::new("G:/Github/wafu/start.bat")
    //     .stdin(Stdio::piped())
    //     .stdout(Stdio::piped())
    //     .spawn()
    //     .expect("Failed to start MoeGoe.exe");
}
