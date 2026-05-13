/* ============================================
   LingoKey Landing Page - i18n
   Supports English (default) and Simplified Chinese
   ============================================ */

const translations = {
  en: {
    "nav.features": "Features",
    "nav.workflow": "Workflow",
    "nav.download": "Download",
    "hero.eyebrow": "Desktop assistant for AI coding",
    "hero.title1": "Write clearer prompts.",
    "hero.title2": "Read AI output faster.",
    "hero.subtitle": "LingoKey is a small system-level window for developers who think in Chinese, work with English AI coding tools, and want less copy-paste friction.",
    "hero.ctaPrimary": "View Releases",
    "hero.ctaSecondary": "See the Workflow",
    "hero.status": "Open source under MIT license",
    "features.eyebrow": "Current App Scope",
    "features.title": "One compact window, four focused views.",
    "features.desc": "The current 0.3.4 app keeps the product narrow: prompt polishing before you send, instant explanation after you read, settings that match your workflow, and local history for reuse.",
    "features.optimize.title": "Prompt Polish",
    "features.optimize.desc": "Turn Chinese or mixed-language drafts into direct, natural prompts for Codex, Claude Code, Cursor, or any AI coding assistant.",
    "features.optimize.li1": "Conservative and enhanced rewrite modes",
    "features.optimize.li2": "Diff highlighting for every change",
    "features.optimize.li3": "Keyboard-first copy and quick submit",
    "features.explain.title": "Instant Explain",
    "features.explain.desc": "Select unfamiliar English from AI output and open a lightweight explanation with meaning, context, and alternate phrasing.",
    "features.explain.li1": "Meaning in your native language",
    "features.explain.li2": "Technical context instead of generic translation",
    "features.explain.li3": "Hotkey trigger with clipboard fallback",
    "features.history.title": "History and Reuse",
    "features.history.desc": "Copied and confirmed results are saved locally so useful phrasing, explanations, and favorites stay close at hand.",
    "features.history.li1": "Recent prompt polish and explain items",
    "features.history.li2": "Favorites for expressions worth keeping",
    "features.history.li3": "Local storage with no cloud sync",
    "workflow.eyebrow": "How It Works",
    "workflow.title": "A shorter loop around AI coding.",
    "workflow.step1.title": "Summon LingoKey",
    "workflow.step1.desc": "Press the main hotkey. A compact always-on-top window opens with the input already focused.",
    "workflow.step2.title": "Polish the Prompt",
    "workflow.step2.desc": "Write in Chinese, English, or a mix. LingoKey rewrites it into your configured learning language while preserving technical intent.",
    "workflow.step3.title": "Copy, Send, and Save",
    "workflow.step3.desc": "Copy the result into your AI coding assistant. Confirmed results are added to local history for quick reuse.",
    "workflow.step4.title": "Explain on Demand",
    "workflow.step4.desc": "When AI output contains an unfamiliar phrase, select it and press the explain hotkey for native-language context.",
    "hotkeys.title": "Built for keyboard-first developers",
    "hotkeys.desc": "Main, explain, and settings shortcuts are customizable. The app also supports theme, opacity, always-on-top, auto-start, language pair, and provider settings.",
    "hotkeys.main": "Polish View",
    "hotkeys.explain": "Explain View",
    "hotkeys.settings": "Settings",
    "download.eyebrow": "Get Started",
    "download.title": "Use your own AI provider.",
    "download.desc": "LingoKey is open source and free. It works with OpenAI-compatible APIs, defaults to DeepSeek, and keeps your API key in local settings.",
    "download.cta": "View Releases",
    "download.github": "View on GitHub",
    "download.platforms": "Windows / macOS / Linux builds via Tauri",
    "footer.copy": "(c) 2026 LingoKey. Open source under MIT license.",
    "footer.github": "GitHub",
    "footer.docs": "Documentation",
    "footer.license": "License",
  },
  zh: {
    "nav.features": "功能",
    "nav.workflow": "流程",
    "nav.download": "下载",
    "hero.eyebrow": "面向 AI 编程的桌面轻助手",
    "hero.title1": "把 Prompt 写清楚。",
    "hero.title2": "把 AI 输出读明白。",
    "hero.subtitle": "LingoKey 是一个系统级小窗口，给中文思考、英文协作的开发者减少复制、翻译、改写和查词之间的来回切换。",
    "hero.ctaPrimary": "查看版本",
    "hero.ctaSecondary": "查看流程",
    "hero.status": "MIT 协议开源",
    "features.eyebrow": "当前应用范围",
    "features.title": "一个轻窗口，四个专注视图。",
    "features.desc": "当前 0.3.4 版本保持克制：发送前润色 prompt，阅读后解释表达，按自己的工作流调整设置，并用本地历史保存可复用内容。",
    "features.optimize.title": "Prompt 润色",
    "features.optimize.desc": "把中文或中英混合草稿整理成自然、直接、可发送给 Codex、Claude Code、Cursor 等 AI 编程助手的英文 prompt。",
    "features.optimize.li1": "保守与增强两种改写模式",
    "features.optimize.li2": "用 diff 高亮展示修改",
    "features.optimize.li3": "键盘优先的复制与快速提交",
    "features.explain.title": "即时解释",
    "features.explain.desc": "在 AI 输出里选中陌生英文表达，用轻量解释视图查看中文释义、技术语境和替代表达。",
    "features.explain.li1": "用你的母语给出释义",
    "features.explain.li2": "偏技术语境，而不是泛泛翻译",
    "features.explain.li3": "热键触发，并支持剪贴板兜底",
    "features.history.title": "历史与复用",
    "features.history.desc": "复制或确认过的结果会保存在本地，常用表达、解释和收藏可以随时找回。",
    "features.history.li1": "保存最近的润色与解释记录",
    "features.history.li2": "收藏值得保留的表达",
    "features.history.li3": "本地存储，不做云同步",
    "workflow.eyebrow": "使用方式",
    "workflow.title": "缩短 AI 编程前后的语言回路。",
    "workflow.step1.title": "唤起 LingoKey",
    "workflow.step1.desc": "按下主热键，一个紧凑的置顶窗口会出现，输入框已经自动聚焦。",
    "workflow.step2.title": "润色 Prompt",
    "workflow.step2.desc": "可以输入中文、英文或中英混合内容。LingoKey 会按你配置的学习语言输出，并尽量保留技术意图。",
    "workflow.step3.title": "复制、发送、保存",
    "workflow.step3.desc": "把结果复制到你的 AI 编程助手里。确认过的结果会进入本地历史，方便下次复用。",
    "workflow.step4.title": "按需解释",
    "workflow.step4.desc": "读 AI 输出时遇到陌生表达，选中后按解释热键，就能看到母语语境说明。",
    "hotkeys.title": "为键盘优先的开发者设计",
    "hotkeys.desc": "主视图、解释视图、设置视图的快捷键都可以修改。应用还支持主题、不透明度、置顶、开机启动、语言组合和 AI 服务商配置。",
    "hotkeys.main": "润色视图",
    "hotkeys.explain": "解释视图",
    "hotkeys.settings": "设置",
    "download.eyebrow": "开始使用",
    "download.title": "接入你自己的 AI 服务。",
    "download.desc": "LingoKey 免费开源，支持 OpenAI-compatible API，默认使用 DeepSeek，API Key 只保存在本地设置里。",
    "download.cta": "查看版本",
    "download.github": "查看 GitHub",
    "download.platforms": "通过 Tauri 构建 Windows / macOS / Linux 版本",
    "footer.copy": "(c) 2026 LingoKey。基于 MIT 协议开源。",
    "footer.github": "GitHub",
    "footer.docs": "文档",
    "footer.license": "许可证",
  },
};

let currentLang = localStorage.getItem("lingokey-landing-lang") || "en";

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem("lingokey-landing-lang", lang);

  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = translations[lang][key];
    if (text === undefined) return;

    if (el.querySelector("svg")) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim().length > 0) {
          node.textContent = text;
          return;
        }
      }
    } else {
      el.textContent = text;
    }
  });

  const label = document.getElementById("langLabel");
  if (label) {
    label.textContent = lang === "zh" ? "中" : "EN";
  }
}

function toggleLanguage() {
  setLanguage(currentLang === "en" ? "zh" : "en");
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLang);
});
