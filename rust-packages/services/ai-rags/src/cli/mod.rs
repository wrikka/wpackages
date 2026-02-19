use crate::application::services::qna_service::QnAService;
use crate::config::RagConfig;
use rustyline::error::ReadlineError;
use rustyline::Editor;

pub async fn run_cli() {
    let config = RagConfig::new();
    let qna_service = QnAService::new(config).await.unwrap();
    let mut rl = Editor::<()>::new().unwrap();

    loop {
        let readline = rl.readline(">> ");
        match readline {
            Ok(line) => {
                if line.trim().is_empty() {
                    continue;
                }
                rl.add_history_entry(line.as_str());
                match qna_service.ask(&line, &[], None).await {
                    Ok(response) => {
                        println!("Response: {}", response.answer);
                    }
                    Err(e) => {
                        println!("Error: {}", e);
                    }
                }
            }
            Err(ReadlineError::Interrupted) => {
                println!("CTRL-C");
                break;
            }
            Err(ReadlineError::Eof) => {
                println!("CTRL-D");
                break;
            }
            Err(err) => {
                println!("Error: {:?}", err);
                break;
            }
        }
    }
}
