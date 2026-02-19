use crate::error::AppResult;
use crate::services::language::Language;
use crate::types::workspace::Workspace;
use std::fs;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct CodeGenerator;

impl CodeGenerator {
    pub fn generate_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let language = Language::detect(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => {
                Self::generate_js_boilerplate(workspace, template)
            }
            Language::Python => Self::generate_python_boilerplate(workspace, template),
            Language::Go => Self::generate_go_boilerplate(workspace, template),
            Language::Rust => Self::generate_rust_boilerplate(workspace, template),
            Language::Java => Self::generate_java_boilerplate(workspace, template),
            Language::Unknown => Err(crate::error::AppError::Task(
                "Unknown language - cannot generate boilerplate".to_string(),
            )),
        }
    }

    fn generate_js_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let content = match template {
            "express" => Self::express_boilerplate(workspace),
            "nextjs" => Self::nextjs_boilerplate(workspace),
            "react" => Self::react_boilerplate(workspace),
            _ => format!("// Unknown template: {}", template),
        };

        Ok(content)
    }

    fn generate_python_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let content = match template {
            "fastapi" => Self::fastapi_boilerplate(workspace),
            "flask" => Self::flask_boilerplate(workspace),
            "cli" => Self::python_cli_boilerplate(workspace),
            _ => format!("# Unknown template: {}", template),
        };

        Ok(content)
    }

    fn generate_go_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let content = match template {
            "http" => Self::go_http_boilerplate(workspace),
            "cli" => Self::go_cli_boilerplate(workspace),
            "grpc" => Self::go_grpc_boilerplate(workspace),
            _ => format!("// Unknown template: {}", template),
        };

        Ok(content)
    }

    fn generate_rust_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let content = match template {
            "http" => Self::rust_http_boilerplate(workspace),
            "cli" => Self::rust_cli_boilerplate(workspace),
            "lib" => Self::rust_lib_boilerplate(workspace),
            _ => format!("// Unknown template: {}", template),
        };

        Ok(content)
    }

    fn generate_java_boilerplate(workspace: &Workspace, template: &str) -> AppResult<String> {
        let content = match template {
            "spring" => Self::spring_boot_boilerplate(workspace),
            "cli" => Self::java_cli_boilerplate(workspace),
            "lib" => Self::java_lib_boilerplate(workspace),
            _ => format!("// Unknown template: {}", template),
        };

        Ok(content)
    }

    fn express_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"import express from 'express';
import {{ Router }} from 'express';

const router = Router();

router.get('/', (req, res) => {{
  res.json({{ message: 'Hello from {}!' }});
}});

export default router;
"#,
            workspace.package_json.name
        )
    }

    fn nextjs_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"export default function Page() {{
  return <div>Hello from {}!</div>;
}}
"#,
            workspace.package_json.name
        )
    }

    fn react_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"import React from 'react';

export const {} = () => {{
  return <div>Hello from {}!</div>;
}};
"#,
            workspace.package_json.name.replace("-", ""),
            workspace.package_json.name
        )
    }

    fn fastapi_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {{"message": "Hello from {}!"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"#,
            workspace.package_json.name
        )
    }

    fn flask_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from {}!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
"#,
            workspace.package_json.name
        )
    }

    fn python_cli_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"import click

@click.command()
def main():
    """CLI tool for {}"""
    click.echo("Hello from {}!")

if __name__ == "__main__":
    main()
"#,
            workspace.package_json.name, workspace.package_json.name
        )
    }

    fn go_http_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {{
    fmt.Fprintf(w, "Hello from %s!", "{}")
}}

func main() {{
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}}
"#,
            workspace.package_json.name
        )
    }

    fn go_cli_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"package main

import (
    "fmt"
)

func main() {{
    fmt.Println("Hello from {}!")
}}
"#,
            workspace.package_json.name
        )
    }

    fn go_grpc_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"syntax = "proto3";

package {};

service Greeter {{
  rpc SayHello (HelloRequest) returns (HelloReply) {{}}
}}

message HelloRequest {{
  string name = 1;
}}

message HelloReply {{
  string message = 1;
}}
"#,
            workspace.package_json.name.replace("-", "_")
        )
    }

    fn rust_http_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"use std::io::prelude::*;
use std::net::TcpListener;

fn main() {{
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    println!("Listening on http://127.0.0.1:7878");

    for stream in listener.incoming() {{
        match stream {{
            Ok(mut stream) => {{
                let response = b"Hello from {}!";
                stream.write_all(response).unwrap();
            }}
            Err(e) => {{
                eprintln!("Connection failed: {{}}", e);
            }}
        }}
    }}
}}
"#,
            workspace.package_json.name
        )
    }

    fn rust_cli_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"use std::env;

fn main() {{
    let args: Vec<String> = env::args().collect();
    println!("Hello from {}!");
    println!("Args: {{:?}}", args);
}}
"#,
            workspace.package_json.name
        )
    }

    fn rust_lib_boilerplate(workspace: &Workspace) -> String {
        format!(r"#![crate_type = "lib"]

pub fn hello() -> String {{
    String::from("Hello from {}!")
}}

#[cfg(test)]
mod tests {{
    use super::*;

    #[test]
    fn test_hello() {{
        assert_eq!(hello(), "Hello from {}!");
    }}
}}
"#, workspace.package_json.name)
    }

    fn spring_boot_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"package {};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class {}Application {{
    public static void main(String[] args) {{
        SpringApplication.run({}Application.class, args);
    }}
}}
"#,
            workspace.package_json.name.replace("-", "."),
            workspace.package_json.name.replace("-", ""),
            workspace.package_json.name.replace("-", "")
        )
    }

    fn java_cli_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"public class {} {{
    public static void main(String[] args) {{
        System.out.println("Hello from {}!");
    }}
}}
"#,
            workspace.package_json.name.replace("-", ""),
            workspace.package_json.name
        )
    }

    fn java_lib_boilerplate(workspace: &Workspace) -> String {
        format!(
            r#"public class {} {{
    public String hello() {{
        return "Hello from {}!";
    }}
}}
"#,
            workspace.package_json.name.replace("-", ""),
            workspace.package_json.name
        )
    }

    pub fn write_boilerplate(
        workspace: &Workspace,
        template: &str,
        output_path: &str,
    ) -> AppResult<()> {
        let content = Self::generate_boilerplate(workspace, template)?;
        let full_path = workspace.path.join(output_path);

        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(&full_path, content)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_code_generator() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };

        let result = CodeGenerator::generate_boilerplate(&workspace, "express");
        assert!(result.is_ok());
        assert!(result.unwrap().contains("Hello from test!"));
    }
}
