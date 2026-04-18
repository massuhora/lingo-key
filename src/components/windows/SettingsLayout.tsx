import {
  Bot,
  Keyboard,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { AppSettings, OutputMode, Theme } from "../../types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HotkeyInput,
  Input,
  Select,
  Slider,
  TitleBar,
  Toggle,
} from "../ui";

interface SettingsLayoutProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  hasChanges?: boolean;
  className?: string;
}

const outputOptions = [
  {
    value: "conservative",
    label: "保守",
    description: "更接近原文语义和结构，适合轻量润色。",
  },
  {
    value: "enhanced",
    label: "增强",
    description: "会更积极地重写表达，适合直接发给 AI。",
  },
];

const themeOptions = [
  {
    value: "dark",
    label: "深色",
    description: "对比更强，适合夜间或深色工作区。",
  },
  {
    value: "light",
    label: "浅色",
    description: "界面更轻盈，适合明亮桌面环境。",
  },
];

const themeMeta: Record<Theme, string> = {
  dark: "深色主题",
  light: "浅色主题",
};

export function SettingsLayout({
  settings,
  onChange,
  onSave,
  onReset,
  hasChanges = false,
  className,
}: SettingsLayoutProps) {
  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateHotkey = (key: keyof AppSettings["hotkeys"], value: string) => {
    onChange({
      ...settings,
      hotkeys: { ...settings.hotkeys, [key]: value },
    });
  };

  return (
    <div
      className={cn(
        "window-shell",
        className,
      )}
    >
      <TitleBar title="设置" />

      <div className="flex flex-1 flex-col overflow-auto px-4 pb-4 pt-4">
        <div className="flex flex-col gap-4">
          <section className="panel-surface px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow-label">Workspace Preferences</p>
                <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground">
                  把 LingoKey 调成更顺手的工作状态
                </h1>
                <p className="mt-2 supporting-text">
                  热键、主题、透明度和 AI 接口配置都在这里统一管理，不改工作流，只优化你的使用手感。
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-accent/10 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="status-chip">{themeMeta[settings.theme]}</span>
              <span className="status-chip">
                {hasChanges ? "有未保存更改" : "已与本地配置同步"}
              </span>
            </div>
          </section>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/55 bg-primary/72 text-foreground/70">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>输出模式</CardTitle>
                <CardDescription>决定润色结果更贴近原文还是更积极优化。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              label="优化风格"
              value={settings.outputMode}
              onChange={(e) =>
                updateSetting("outputMode", e.target.value as OutputMode)
              }
              options={outputOptions}
            />
            <p className="mt-3 text-xs leading-5 text-foreground/50">
              保守模式更接近原文；增强模式会进行更积极的改进。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/55 bg-primary/72 text-foreground/70">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>外观</CardTitle>
                <CardDescription>调整主题和透明度，让窗口更融入你的桌面环境。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select
              label="主题"
              value={settings.theme}
              onChange={(e) =>
                updateSetting("theme", e.target.value as Theme)
              }
              options={themeOptions}
            />
            <Slider
              label="窗口不透明度"
              min={0.3}
              max={1.0}
              step={0.05}
              value={settings.opacity}
              onChange={(e) =>
                updateSetting("opacity", parseFloat(e.target.value))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/55 bg-primary/72 text-foreground/70">
                <Keyboard className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>快捷键</CardTitle>
                <CardDescription>为三个窗口设置更顺手的全局热键组合。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <HotkeyInput
              label="主窗口"
              value={settings.hotkeys.main}
              onChange={(value) => updateHotkey("main", value)}
            />
            <HotkeyInput
              label="解释窗口"
              value={settings.hotkeys.explain}
              onChange={(value) => updateHotkey("explain", value)}
            />
            <HotkeyInput
              label="设置窗口"
              value={settings.hotkeys.settings}
              onChange={(value) => updateHotkey("settings", value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/55 bg-primary/72 text-foreground/70">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>AI 服务商</CardTitle>
                <CardDescription>接入任何兼容 OpenAI 的接口地址、密钥和模型。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              label="接口地址"
              type="url"
              value={settings.aiProvider.baseUrl}
              onChange={(e) =>
                updateSetting("aiProvider", {
                  ...settings.aiProvider,
                  baseUrl: e.target.value,
                })
              }
              placeholder="https://api.openai.com/v1"
            />
            <Input
              label="API 密钥"
              type="password"
              value={settings.aiProvider.apiKey}
              onChange={(e) =>
                updateSetting("aiProvider", {
                  ...settings.aiProvider,
                  apiKey: e.target.value,
                })
              }
              placeholder="sk-..."
            />
            <Input
              label="模型"
              value={settings.aiProvider.model}
              onChange={(e) =>
                updateSetting("aiProvider", {
                  ...settings.aiProvider,
                  model: e.target.value,
                })
              }
              placeholder="gpt-4o-mini"
            />
            <p className="text-xs leading-5 text-foreground/50">
              支持任何兼容 OpenAI 的 API。留空 API 密钥以使用备用模式。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/55 bg-primary/72 text-foreground/70">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>偏好设置</CardTitle>
                <CardDescription>控制窗口行为，保持 LingoKey 与你的工作区节奏一致。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Toggle
              label="置顶显示"
              description="让 LingoKey 始终显示在其他窗口之上"
              checked={settings.alwaysOnTop}
              onChange={(e) => updateSetting("alwaysOnTop", e.target.checked)}
            />
            <div className="h-px bg-border" />
            <Toggle
              label="开机自启"
              description="系统启动时自动运行 LingoKey"
              checked={settings.autoStart}
              onChange={(e) => updateSetting("autoStart", e.target.checked)}
            />
          </CardContent>
        </Card>

          <div className="sticky bottom-0 z-10 mt-auto pt-6">
            <div className="panel-surface flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {hasChanges ? "有未保存更改" : "设置已同步"}
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/52">
                  {hasChanges
                    ? "保存后会立即应用到对应窗口。"
                    : "你当前看到的是已生效的本地配置。"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onReset}
                  className="gap-2"
                  disabled={!hasChanges}
                >
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
                <Button
                  onClick={onSave}
                  className="min-w-[128px] gap-2"
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4" />
                  保存更改
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
