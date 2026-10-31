"use client";
import { useTranslations } from "next-intl";
import { useLocale } from "./LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  return <label className="language-toggle text-xs font-medium" style={{ color: "var(--muted)" }}>{t("language")}{" "}
    <select aria-label={t("language")} className="theme-toggle" value={locale} onChange={(e) => setLocale(e.target.value as "en" | "pt")}>
      <option value="en">English</option><option value="pt">Português</option>
    </select>
  </label>;
}
