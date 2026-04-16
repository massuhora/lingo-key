use serde::{Deserialize, Serialize};
use crate::AppState;

#[derive(Serialize, Clone, Debug)]
pub struct ExplainResult {
    pub original: String,
    pub meaning: String,
    pub context: String,
}

#[derive(Serialize, Debug)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Debug)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<ChatMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    response_format: Option<ResponseFormat>,
    temperature: f32,
}

#[derive(Serialize, Debug)]
struct ResponseFormat {
    #[serde(rename = "type")]
    format_type: String,
}

#[derive(Deserialize, Debug)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
struct Choice {
    message: ChoiceMessage,
}

#[derive(Deserialize, Debug)]
struct ChoiceMessage {
    content: String,
}

fn build_optimize_prompt(text: &str, mode: &str) -> Vec<ChatMessage> {
    let mode_instruction = if mode == "conservative" {
        "Keep changes minimal. Fix grammar, spelling, and unnatural phrasing. Do NOT add technical requirements beyond what the user explicitly stated."
    } else {
        "Make the expression more natural and polished, but still do NOT add technical requirements beyond what the user explicitly stated."
    };

    let system = format!(
        "You are LingoKey, an AI assistant for developers who work with AI coding tools like Codex, Claude Code, and Cursor.\n\
        Your task is to rewrite the user's input into natural, accurate English that can be sent directly as a prompt.\n\n\
        Mode: {}\n\
        {}\n\n\
        Only return the rewritten text. Do not add quotes, explanations, or markdown formatting.",
        mode, mode_instruction
    );

    vec![
        ChatMessage { role: "system".to_string(), content: system },
        ChatMessage { role: "user".to_string(), content: text.to_string() },
    ]
}

fn build_explain_prompt(text: &str) -> Vec<ChatMessage> {
    let system = "You are LingoKey, an assistant helping developers understand English expressions they encounter while working with AI coding tools.\n\
        Given a word, phrase, sentence, or short paragraph, provide a helpful explanation.\n\n\
        Return your answer as a JSON object with these exact keys:\n\
        - meaning: Accurate and complete Chinese translation of the entire input. Do not omit any sentences.\n\
        - context: General context where this expression is used\n\
        Only return the JSON object. Do not wrap it in markdown code blocks.".to_string();

    vec![
        ChatMessage { role: "system".to_string(), content: system },
        ChatMessage { role: "user".to_string(), content: text.to_string() },
    ]
}

async fn call_llm(
    provider: &crate::commands::settings::AiProvider,
    messages: Vec<ChatMessage>,
    json_mode: bool,
) -> Result<String, String> {
    if provider.api_key.trim().is_empty() {
        return Err("API key is not configured. Please set it in Settings > AI Provider.".to_string());
    }

    let base_url = provider.base_url.trim_end_matches('/');
    let url = format!("{}/chat/completions", base_url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let mut request = ChatCompletionRequest {
        model: provider.model.clone(),
        messages,
        response_format: None,
        temperature: 0.3,
    };

    if json_mode {
        request.response_format = Some(ResponseFormat {
            format_type: "json_object".to_string(),
        });
    }

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", provider.api_key))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("LLM API error ({}): {}", status, body));
    }

    let completion: ChatCompletionResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    completion
        .choices
        .into_iter()
        .next()
        .map(|c| c.message.content.trim().to_string())
        .ok_or_else(|| "Empty response from LLM".to_string())
}

/// Optimize the given Chinese/mixed text into polished English.
#[tauri::command]
pub async fn optimize_text(
    state: tauri::State<'_, AppState>,
    text: String,
    mode: String,
) -> Result<String, String> {
    let provider = {
        let settings = state.settings.lock().map_err(|e| e.to_string())?;
        settings.ai_provider.clone()
    };

    let messages = build_optimize_prompt(&text, &mode);
    match call_llm(&provider, messages, false).await {
        Ok(result) => Ok(result),
        Err(e) => {
            // Graceful fallback with a clear hint when API is unavailable.
            let fallback = format!(
                "{}",
                text.trim().chars().next().map(|c| c.to_uppercase().to_string() + &text.trim()[c.len_utf8()..]).unwrap_or_default()
            );
            let fallback = if !fallback.ends_with(|c: char| c == '.' || c == '!' || c == '?') {
                format!("{}.", fallback)
            } else {
                fallback
            };
            Err(format!("{}\n\n(Fallback result: {})", e, fallback))
        }
    }
}

/// Explain the given English text.
#[tauri::command]
pub async fn explain_text(
    state: tauri::State<'_, AppState>,
    text: String,
) -> Result<ExplainResult, String> {
    let provider = {
        let settings = state.settings.lock().map_err(|e| e.to_string())?;
        settings.ai_provider.clone()
    };

    let messages = build_explain_prompt(&text);
    match call_llm(&provider, messages, true).await {
        Ok(raw) => {
            // Try to parse JSON response.
            let cleaned = raw
                .trim()
                .trim_start_matches("```json")
                .trim_start_matches("```")
                .trim_end_matches("```")
                .trim();

            #[derive(Deserialize)]
            struct RawExplain {
                meaning: String,
                context: String,
            }

            let parsed: RawExplain = serde_json::from_str(cleaned)
                .map_err(|e| format!("Failed to parse explanation JSON: {}\nRaw: {}", e, raw))?;

            Ok(ExplainResult {
                original: text,
                meaning: parsed.meaning,
                context: parsed.context,
            })
        }
        Err(e) => {
            // Graceful fallback.
            Err(e)
        }
    }
}
