import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "./LocaleProvider";
import { LanguageToggle } from "./LanguageToggle";

describe("internationalization", () => {
  beforeEach(() => localStorage.clear());
  it("changes language and saves selection", async () => {
    render(<LocaleProvider><LanguageToggle /></LocaleProvider>);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "pt" } });
    expect(screen.getByText("Idioma")).toBeInTheDocument();
    expect(localStorage.getItem("task-locale")).toBe("pt");
    expect(document.documentElement.lang).toBe("pt-BR");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
    expect(screen.getByText("Language")).toBeInTheDocument();
  });
  it("loads a saved language", async () => {
    localStorage.setItem("task-locale", "pt");
    render(<LocaleProvider><LanguageToggle /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText("Idioma")).toBeInTheDocument());
  });
});
