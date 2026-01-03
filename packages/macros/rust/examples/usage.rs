use w_proc_macros::Builder;

#[derive(Builder)]
pub struct Command {
    executable: String,
    args: Vec<String>,
    env: Vec<String>,
    current_dir: String,
}

fn main() {
    let command = Command::builder()
        .executable("cargo".to_string())
        .args(vec!["build".to_string(), "--release".to_string()])
        .env(vec![])
        .current_dir(".".to_string())
        .build()
        .unwrap();

    assert_eq!(command.executable, "cargo");
}
