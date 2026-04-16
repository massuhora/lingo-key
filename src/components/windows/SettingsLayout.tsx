import { RotateCcw, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AppSettings, OutputMode } from "../../types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HotkeyInput,
  Input,
  Select,
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
  { value: "conservative", label: "保守" },
  { value: "enhanced", label: "增强" },
];

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
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
        className,
      )}
    >
      <TitleBar title="设置" />

      <div className="flex flex-1 flex-col gap-4 overflow-auto px-4 pb-4">
        {/* Output Mode */}
        <Card>
          <CardHeader>
            <CardTitle>输出模式</CardTitle>
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
            <p className="mt-2 text-xs text-foreground/50">
              保守模式更接近原文；增强模式会进行更积极的改进。
            </p>
          </CardContent>
        </Card>

        {/* Hotkeys */}
        <Card>
          <CardHeader>
            <CardTitle>快捷键</CardTitle>
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

        {/* AI Provider */}
        <Card>
          <CardHeader>
            <CardTitle>AI 服务商</CardTitle>
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
            <p className="text-xs text-foreground/50">
              支持任何兼容 OpenAI 的 API。留空 API 密钥以使用备用模式。
            </p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>偏好设置</CardTitle>
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

        {/* Actions */}
        <div className="mt-auto flex items-center justify-end gap-3 pt-2">
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
            className="gap-2"
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4" />
            保存更改
          </Button>
        </div>
      </div>
    </div>
  );
}
