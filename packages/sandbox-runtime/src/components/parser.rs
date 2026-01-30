use crate::error::RuntimeError;
use crate::types::command::{Command, LsFlags};

pub fn parse_command(input: &str) -> Result<Command, RuntimeError> {
    let args = shlex::split(input).ok_or(RuntimeError::InvalidCommand)?;
    if args.is_empty() {
        // Mimic shell behavior: empty command is a no-op
        return Ok(Command::Pwd); // Placeholder, should be a NoOp command
    }

    let (cmd, args) = args.split_at(1);
    let cmd = cmd.first().ok_or(RuntimeError::InvalidCommand)?;

    match cmd.as_str() {
        "pwd" => Ok(Command::Pwd),
        "cd" => {
            let path = args.first().map_or("/".to_string(), |s| s.to_string());
            Ok(Command::Cd { path })
        }
        "ls" => {
            let mut path = ".".to_string();
            let mut flags = Vec::new();
            for arg in args {
                if arg == "-l" {
                    flags.push(LsFlags::Long);
                } else if !arg.starts_with('-') {
                    path = arg.to_string();
                }
            }
            Ok(Command::Ls { path, flags })
        }
        "mkdir" => {
            let path = args
                .first()
                .ok_or(RuntimeError::MissingOperand {
                    cmd: "mkdir".to_string(),
                })?
                .to_string();
            Ok(Command::Mkdir { path })
        }
        "touch" => {
            let path = args
                .first()
                .ok_or(RuntimeError::MissingOperand {
                    cmd: "touch".to_string(),
                })?
                .to_string();
            Ok(Command::Touch { path })
        }
        "write_file" => {
            let path = args
                .first()
                .ok_or(RuntimeError::MissingOperand {
                    cmd: "write_file".to_string(),
                })?
                .to_string();
            let content = args.get(1).map_or("".to_string(), |s| s.to_string());
            Ok(Command::WriteFile { path, content })
        }
        "read_file" => {
            let path = args
                .first()
                .ok_or(RuntimeError::MissingOperand {
                    cmd: "read_file".to_string(),
                })?
                .to_string();
            Ok(Command::ReadFile { path })
        }
        "chmod" => {
            let mode_str = args.first().ok_or(RuntimeError::MissingOperand {
                cmd: "chmod".to_string(),
            })?;
            let path = args
                .get(1)
                .ok_or(RuntimeError::MissingOperand {
                    cmd: "chmod".to_string(),
                })?
                .to_string();
            let mode = u16::from_str_radix(mode_str, 8).map_err(|_| RuntimeError::InvalidMode {
                cmd: "chmod".to_string(),
                mode: mode_str.to_string(),
            })?;
            Ok(Command::Chmod { mode, path })
        }
        "js" => {
            let script = args.join(" ");
            Ok(Command::Js { script })
        }
        _ => Ok(Command::Unknown(cmd.to_string())),
    }
}
