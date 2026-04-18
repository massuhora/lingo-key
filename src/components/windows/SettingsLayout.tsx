import {
  Bot,
  Keyboard,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Zap,
  type LucideIcon,
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

interface SettingsSectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  contentClassName?: string;
}

function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  badge,
  children,
  contentClassName,
}: SettingsSectionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-accent/18 bg-[radial-gradient(circle_at_top,rgb(var(--accent)/0.22),transparent_72%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] text-accent shadow-[0_18px_34px_-28px_rgb(var(--accent)/0.75)]">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {badge && <span className="status-chip shrink-0">{badge}</span>}
        </div>
      </CardHeader>
      <CardContent className={cn("border-t border-border/40 pt-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

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

  const outputModeLabel =
    outputOptions.find((option) => option.value === settings.outputMode)?.label ??
    "保守";
  const aiStatusLabel = settings.aiProvider.apiKey ? "已配置密钥" : "备用模式";
  const preferenceStatus = settings.alwaysOnTop ? "置顶开启" : "按需显示";

  return (
    <div
      className={cn(
        "window-shell settings-backdrop",
        className,
      )}
    >
      <TitleBar title="设置" />

      <div className="relative flex flex-1 flex-col overflow-auto px-4 pb-4 pt-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-4 h-40 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgb(var(--accent)/0.14),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] blur-2xl"
        />
        <div className="relative flex flex-col gap-4">
          <section className="panel-surface overflow-hidden px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow-label">Workspace Preferences</p>
                <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground">
                  把 LingoKey 调成更顺手的工作状态
                </h1>
                <p className="mt-2 supporting-text max-w-[34rem]">
                  热键、主题、透明度和 AI 接口配置都在这里统一管理。深色模式下重点是更稳的层级、更清楚的焦点反馈，以及更低的视觉噪声。
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-accent/20 bg-[radial-gradient(circle_at_top,rgb(var(--accent)/0.24),transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] text-accent shadow-[0_20px_40px_-30px_rgb(var(--accent)/0.9)]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="subtle-divider my-5" />
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">Theme</p>
                <p className="mt-2 text-sm font-medium text-foreground">{themeMeta[settings.theme]}</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">Profile</p>
                <p className="mt-2 text-sm font-medium text-foreground">{outputModeLabel} 输出</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">Sync</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {hasChanges ? "有未保存更改" : "已与本地配置同步"}
                </p>
              </div>
            </div>
          </section>

          <SettingsSectionCard
            icon={Zap}
            title="输出模式"
            description="决定润色结果更贴近原文还是更积极优化。"
            badge={outputModeLabel}
          >
            <div className="flex flex-col gap-3">
              <Select
                label="优化风格"
                value={settings.outputMode}
                onChange={(e) =>
                  updateSetting("outputMode", e.target.value as OutputMode)
                }
                options={outputOptions}
              />
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  保守模式更接近原文；增强模式会进行更积极的改写，更适合直接提交给 AI 编程助手。
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Palette}
            title="外观"
            description="调整主题和透明度，让窗口更融入你的桌面环境。"
            badge={themeMeta[settings.theme]}
          >
            <div className="flex flex-col gap-3">
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
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Keyboard}
            title="快捷键"
            description="为三个窗口设置更顺手的全局热键组合。"
            badge="3 组热键"
          >
            <div className="flex flex-col gap-3">
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
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  尽量避免与系统保留快捷键或 IDE 常用组合冲突，尤其是 <span className="kbd-chip mx-1">Ctrl+Shift</span> 系列。
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Bot}
            title="AI 服务商"
            description="接入任何兼容 OpenAI 的接口地址、密钥和模型。"
            badge={aiStatusLabel}
          >
            <div className="flex flex-col gap-3">
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
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  支持任何兼容 OpenAI 的 API。留空 API 密钥时会继续使用本地备用模式，适合先验证界面和流程。
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={SlidersHorizontal}
            title="偏好设置"
            description="控制窗口行为，保持 LingoKey 与你的工作区节奏一致。"
            badge={preferenceStatus}
          >
            <div className="flex flex-col gap-3">
              <Toggle
                label="置顶显示"
                description="让 LingoKey 始终显示在其他窗口之上"
                checked={settings.alwaysOnTop}
                onChange={(e) => updateSetting("alwaysOnTop", e.target.checked)}
              />
              <div className="subtle-divider" />
              <Toggle
                label="开机自启"
                description="系统启动时自动运行 LingoKey"
                checked={settings.autoStart}
                onChange={(e) => updateSetting("autoStart", e.target.checked)}
              />
            </div>
          </SettingsSectionCard>

          <div className="sticky bottom-0 z-10 mt-auto pt-6">
            <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.05),0_18px_44px_-28px_rgb(var(--shadow-strong)/0.75)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
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
    </div>
  );
}
