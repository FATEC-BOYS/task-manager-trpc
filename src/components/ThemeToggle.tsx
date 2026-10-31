"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
export function ThemeToggle() {
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
  return <button type="button" onClick={toggle} className="theme-toggle" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
    <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span> {theme === "light" ? "Dark mode" : "Light mode"}
  </button>;
}
