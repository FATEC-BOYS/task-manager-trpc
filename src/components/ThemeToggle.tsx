"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Theme = "light" | "dark";
export function ThemeToggle() {
  const t = useTranslations();
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = window.localStorage.getItem("task-theme");
    const preferred = stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
  }, []);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("task-theme", next);
  }
  return <button type="button" onClick={toggle} className="theme-toggle" aria-label={theme === "light" ? t("darkMode") : t("lightMode")}>
    <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
  </button>;
}
