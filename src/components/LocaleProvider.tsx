"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messages, type Locale } from "@/i18n/messages";

type LocaleContext = { locale: Locale; setLocale: (locale: Locale) => void };
const Context = createContext<LocaleContext>({ locale: "en", setLocale: () => {} });
export const useLocale = () => useContext(Context);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const stored = window.localStorage.getItem("task-locale");
    const preferred: Locale = stored === "pt" || stored === "en" ? stored : navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
    setLocale(preferred);
    document.documentElement.lang = preferred === "pt" ? "pt-BR" : "en";
  }, []);
  function change(next: Locale) {
    setLocale(next);
    window.localStorage.setItem("task-locale", next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }
  return <Context.Provider value={{ locale, setLocale: change }}>
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>{children}</NextIntlClientProvider>
  </Context.Provider>;
}
