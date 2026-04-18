import {
  Bot,
  Keyboard,
  Languages,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getLanguageOptions, getLocaleOptions, useI18n } from "../../lib/i18n";
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
  const { locale, t, getLanguageLabel } = useI18n();

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

  const localeOptions = getLocaleOptions(locale).map((option) => ({
    ...option,
    description: option.label,
  }));
  const languageOptions = getLanguageOptions(locale);
  const outputOptions = [
    {
      value: "conservative",
      label: t("settings.outputMode.conservative"),
      description: t("settings.outputMode.conservativeDescription"),
    },
    {
      value: "enhanced",
      label: t("settings.outputMode.enhanced"),
      description: t("settings.outputMode.enhancedDescription"),
    },
  ];
  const themeOptions = [
    {
      value: "dark",
      label: t("settings.theme.dark"),
      description: t("settings.theme.darkDescription"),
    },
    {
      value: "light",
      label: t("settings.theme.light"),
      description: t("settings.theme.lightDescription"),
    },
  ];
  const themeMeta: Record<Theme, string> = {
    dark: t("settings.themeBadge.dark"),
    light: t("settings.themeBadge.light"),
  };

  const outputModeLabel =
    outputOptions.find((option) => option.value === settings.outputMode)?.label ??
    t("settings.outputMode.conservative");
  const localeLabel =
    localeOptions.find((option) => option.value === settings.locale)?.label ?? settings.locale;
  const nativeLanguageLabel = getLanguageLabel(settings.nativeLanguage);
  const learningLanguageLabel = getLanguageLabel(settings.learningLanguage);
  const languageSummaryLabel = t("settings.languageSummaryValue", {
    native: nativeLanguageLabel,
    learning: learningLanguageLabel,
  });
  const aiStatusLabel = settings.aiProvider.apiKey ? t("settings.aiConfigured") : t("settings.aiFallback");
  const preferenceStatus = settings.alwaysOnTop ? t("settings.preferencesOnTop") : t("settings.preferencesOnDemand");

  return (
    <div className={cn("window-shell settings-backdrop", className)}>
      <TitleBar title={t("settings.title")} />

      <div className="relative flex flex-1 flex-col overflow-auto px-4 pb-4 pt-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-4 h-40 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgb(var(--accent)/0.14),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] blur-2xl"
        />
        <div className="relative flex flex-col gap-4">
          <section className="panel-surface overflow-hidden px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow-label">{t("settings.summaryEyebrow")}</p>
                <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-foreground">
                  {t("settings.heroTitle")}
                </h1>
                <p className="mt-2 supporting-text max-w-[34rem]">
                  {t("settings.heroDescription")}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-accent/20 bg-[radial-gradient(circle_at_top,rgb(var(--accent)/0.24),transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] text-accent shadow-[0_20px_40px_-30px_rgb(var(--accent)/0.9)]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="subtle-divider my-5" />
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">{t("settings.summaryTheme")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{themeMeta[settings.theme]}</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">{t("settings.summaryLocale")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{localeLabel}</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">{t("settings.summaryLanguages")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{languageSummaryLabel}</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">{t("settings.summaryProfile")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{outputModeLabel}</p>
              </div>
              <div className="rounded-[22px] border border-border/50 bg-primary/54 px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.03)]">
                <p className="eyebrow-label">{t("settings.summarySync")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {hasChanges ? t("common.unsavedChanges") : t("common.synced")}
                </p>
              </div>
            </div>
          </section>

          <SettingsSectionCard
            icon={Languages}
            title={t("settings.languageSectionTitle")}
            description={t("settings.languageSectionDescription")}
            badge={localeLabel}
          >
            <div className="flex flex-col gap-3">
              <Select
                label={t("settings.uiLanguage")}
                value={settings.locale}
                onChange={(event) =>
                  updateSetting("locale", event.target.value as AppSettings["locale"])
                }
                options={localeOptions}
              />
              <Select
                label={t("settings.nativeLanguage")}
                value={settings.nativeLanguage}
                onChange={(event) =>
                  updateSetting("nativeLanguage", event.target.value as AppSettings["nativeLanguage"])
                }
                options={languageOptions.map((option) => ({
                  ...option,
                  description: t("settings.nativeLanguageDescription", { language: option.label }),
                }))}
              />
              <Select
                label={t("settings.learningLanguage")}
                value={settings.learningLanguage}
                onChange={(event) =>
                  updateSetting("learningLanguage", event.target.value as AppSettings["learningLanguage"])
                }
                options={languageOptions.map((option) => ({
                  ...option,
                  description: t("settings.learningLanguageDescription", { language: option.label }),
                }))}
              />
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  {t("settings.languageSectionHint")}
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Zap}
            title={t("settings.outputModeTitle")}
            description={t("settings.outputModeDescription")}
            badge={outputModeLabel}
          >
            <div className="flex flex-col gap-3">
              <Select
                label={t("settings.outputMode")}
                value={settings.outputMode}
                onChange={(event) =>
                  updateSetting("outputMode", event.target.value as OutputMode)
                }
                options={outputOptions}
              />
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  {t("settings.outputModeHint")}
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Palette}
            title={t("settings.appearanceTitle")}
            description={t("settings.appearanceDescription")}
            badge={themeMeta[settings.theme]}
          >
            <div className="flex flex-col gap-3">
              <Select
                label={t("settings.theme")}
                value={settings.theme}
                onChange={(event) =>
                  updateSetting("theme", event.target.value as Theme)
                }
                options={themeOptions}
              />
              <Slider
                label={t("settings.opacity")}
                min={0.3}
                max={1.0}
                step={0.05}
                value={settings.opacity}
                onChange={(event) =>
                  updateSetting("opacity", parseFloat(event.target.value))
                }
              />
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Keyboard}
            title={t("settings.hotkeysTitle")}
            description={t("settings.hotkeysDescription")}
            badge={t("settings.hotkeysBadge")}
          >
            <div className="flex flex-col gap-3">
              <HotkeyInput
                label={t("settings.hotkey.main")}
                value={settings.hotkeys.main}
                onChange={(value) => updateHotkey("main", value)}
              />
              <HotkeyInput
                label={t("settings.hotkey.explain")}
                value={settings.hotkeys.explain}
                onChange={(value) => updateHotkey("explain", value)}
              />
              <HotkeyInput
                label={t("settings.hotkey.settings")}
                value={settings.hotkeys.settings}
                onChange={(value) => updateHotkey("settings", value)}
              />
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  {t("settings.hotkeysHint")}
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={Bot}
            title={t("settings.aiTitle")}
            description={t("settings.aiDescription")}
            badge={aiStatusLabel}
          >
            <div className="flex flex-col gap-3">
              <Input
                label={t("settings.aiBaseUrl")}
                type="url"
                value={settings.aiProvider.baseUrl}
                onChange={(event) =>
                  updateSetting("aiProvider", {
                    ...settings.aiProvider,
                    baseUrl: event.target.value,
                  })
                }
                placeholder="https://api.openai.com/v1"
              />
              <Input
                label={t("settings.aiApiKey")}
                type="password"
                value={settings.aiProvider.apiKey}
                onChange={(event) =>
                  updateSetting("aiProvider", {
                    ...settings.aiProvider,
                    apiKey: event.target.value,
                  })
                }
                placeholder="sk-..."
              />
              <Input
                label={t("settings.aiModel")}
                value={settings.aiProvider.model}
                onChange={(event) =>
                  updateSetting("aiProvider", {
                    ...settings.aiProvider,
                    model: event.target.value,
                  })
                }
                placeholder="gpt-4o-mini"
              />
              <div className="panel-inset px-4 py-3">
                <p className="text-xs leading-5 text-foreground/58">
                  {t("settings.aiHint")}
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={SlidersHorizontal}
            title={t("settings.preferencesTitle")}
            description={t("settings.preferencesDescription")}
            badge={preferenceStatus}
          >
            <div className="flex flex-col gap-3">
              <Toggle
                label={t("settings.alwaysOnTop")}
                description={t("settings.alwaysOnTopDescription")}
                checked={settings.alwaysOnTop}
                onChange={(event) => updateSetting("alwaysOnTop", event.target.checked)}
              />
              <div className="subtle-divider" />
              <Toggle
                label={t("settings.autoStart")}
                description={t("settings.autoStartDescription")}
                checked={settings.autoStart}
                onChange={(event) => updateSetting("autoStart", event.target.checked)}
              />
            </div>
          </SettingsSectionCard>

          <div className="sticky bottom-0 z-10 mt-auto pt-6">
            <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-4 py-3 shadow-[inset_0_1px_0_rgb(var(--foreground)/0.05),0_18px_44px_-28px_rgb(var(--shadow-strong)/0.75)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {hasChanges ? t("common.unsavedChanges") : t("common.synced")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground/52">
                    {hasChanges
                      ? t("settings.footerUnsavedDescription")
                      : t("settings.footerSavedDescription")}
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
                    {t("common.reset")}
                  </Button>
                  <Button
                    onClick={onSave}
                    className="min-w-[128px] gap-2"
                    disabled={!hasChanges}
                  >
                    <Save className="h-4 w-4" />
                    {t("common.saveChanges")}
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
