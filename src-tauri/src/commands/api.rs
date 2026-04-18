use serde::{Deserialize, Serialize};
use crate::AppState;

fn localized(locale: &str, zh: &str, en: &str) -> String {
    if crate::commands::settings::is_chinese_locale(locale) {
        zh.to_string()
    } else {
        en.to_string()
    }
}

fn localized_error(locale: &str, zh: &str, en: &str, details: impl std::fmt::Display) -> String {
    format!("{}: {}", localized(locale, zh, en), details)
}

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

fn language_name(language: &str) -> &str {
    match language {
        "chinese" => "Chinese",
        "english" => "English",
        "japanese" => "Japanese",
        "korean" => "Korean",
        "spanish" => "Spanish",
        "french" => "French",
        "german" => "German",
        _ => "English",
    }
}

fn build_optimize_prompt(
    text: &str,
    mode: &str,
    native_language: &str,
    learning_language: &str,
) -> Vec<ChatMessage> {
    let mode_instruction = if mode == "conservative" {
        "Keep changes minimal. Fix grammar, spelling, and unnatural phrasing. Do NOT add technical requirements beyond what the user explicitly stated."
    } else {
        "Make the expression more natural and polished, but still do NOT add technical requirements beyond what the user explicitly stated."
    };
    let native_language = language_name(native_language);
    let learning_language = language_name(learning_language);

    let system = format!(
        "You are LingoKey, an AI assistant for developers who work with AI coding tools like Codex, Claude Code, and Cursor.\n\
        The user's native language is {}.\n\
        The language they are learning and want to write in is {}.\n\
        Your task is to rewrite the user's input into natural, accurate {} that can be sent directly as a prompt.\n\
        The input may be in the native language, the learning language, or a mixture of both. Preserve the full intent and normalize the final result entirely in {}.\n\n\
        Mode: {}\n\
        {}\n\n\
        Only return the rewritten text. Do not add quotes, explanations, or markdown formatting.",
        native_language, learning_language, learning_language, learning_language, mode, mode_instruction
    );

    vec![
        ChatMessage { role: "system".to_string(), content: system },
        ChatMessage { role: "user".to_string(), content: text.to_string() },
    ]
}

fn build_explain_prompt(text: &str, native_language: &str, learning_language: &str) -> Vec<ChatMessage> {
    let native_language = language_name(native_language);
    let learning_language = language_name(learning_language);
    let system = format!(
        "You are LingoKey, an assistant helping developers understand expressions they encounter while working with AI coding tools.\n\
        The user's native language is {}.\n\
        The language they are learning is {}.\n\
        Treat the user's input as primarily written in {} unless the text clearly indicates otherwise.\n\
        Given a word, phrase, sentence, or short paragraph, provide a helpful explanation in {}.\n\n\
        Return your answer as a JSON object with these exact keys:\n\
        - meaning: Accurate and complete {} explanation or translation of the entire input. Do not omit any sentences.\n\
        - context: A concise explanation in {} of the general context where this expression is used\n\
        Only return the JSON object. Do not wrap it in markdown code blocks.",
        native_language, learning_language, learning_language, native_language, native_language, native_language
    );

    vec![
        ChatMessage { role: "system".to_string(), content: system },
        ChatMessage { role: "user".to_string(), content: text.to_string() },
    ]
}

async fn call_llm(
    provider: &crate::commands::settings::AiProvider,
    messages: Vec<ChatMessage>,
    json_mode: bool,
    locale: &str,
) -> Result<String, String> {
    if provider.api_key.trim().is_empty() {
        return Err(localized(
            locale,
            "尚未配置 API 密钥，请先在“设置 > AI 服务商”中填写。",
            "API key is not configured. Please set it in Settings > AI Provider.",
        ));
    }

    let base_url = provider.base_url.trim_end_matches('/');
    let url = format!("{}/chat/completions", base_url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| localized_error(locale, "初始化请求客户端失败", "Failed to initialize request client", e))?;

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
        .map_err(|e| localized_error(locale, "请求失败", "Request failed", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(localized_error(locale, &format!("LLM 接口错误 ({})", status), &format!("LLM API error ({})", status), body));
    }

    let completion: ChatCompletionResponse = response
        .json()
        .await
        .map_err(|e| localized_error(locale, "解析接口响应失败", "Failed to parse response", e))?;

    completion
        .choices
        .into_iter()
        .next()
        .map(|c| c.message.content.trim().to_string())
        .ok_or_else(|| localized(locale, "LLM 返回了空响应", "Empty response from LLM"))
}

/// Optimize the given text into the configured learning language.
#[tauri::command]
pub async fn optimize_text(
    state: tauri::State<'_, AppState>,
    text: String,
    mode: String,
) -> Result<String, String> {
    let settings = {
        let settings = state.settings.lock().map_err(|e| e.to_string())?;
        settings.clone()
    };

    let messages = build_optimize_prompt(
        &text,
        &mode,
        &settings.native_language,
        &settings.learning_language,
    );
    match call_llm(&settings.ai_provider, messages, false, &settings.locale).await {
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
            if crate::commands::settings::is_chinese_locale(&settings.locale) {
                Err(format!("{}\n\n备用结果：{}", e, fallback))
            } else {
                Err(format!("{}\n\nFallback result: {}", e, fallback))
            }
        }
    }
}

/// Explain the given text using the configured native and learning languages.
#[tauri::command]
pub async fn explain_text(
    state: tauri::State<'_, AppState>,
    text: String,
) -> Result<ExplainResult, String> {
    let settings = {
        let settings = state.settings.lock().map_err(|e| e.to_string())?;
        settings.clone()
    };

    let messages = build_explain_prompt(
        &text,
        &settings.native_language,
        &settings.learning_language,
    );
    match call_llm(&settings.ai_provider, messages, true, &settings.locale).await {
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
                .map_err(|e| {
                    if crate::commands::settings::is_chinese_locale(&settings.locale) {
                        format!("解析解释结果 JSON 失败: {}\n原始内容: {}", e, raw)
                    } else {
                        format!("Failed to parse explanation JSON: {}\nRaw: {}", e, raw)
                    }
                })?;

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
