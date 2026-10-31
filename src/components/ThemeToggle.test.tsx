import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { messages } from "@/i18n/messages";

function mount() { return render(<NextIntlClientProvider locale="en" messages={messages.en}><ThemeToggle /></NextIntlClientProvider>); }
describe("ThemeToggle", () => {
  beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme; });
  it("switches between light and dark and persists preference", async () => {
    mount();
    await waitFor(() => expect(screen.getByRole("button", { name: "Dark mode" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("task-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Light mode" }));
    expect(localStorage.getItem("task-theme")).toBe("light");
  });
  it("restores saved dark theme", async () => {
    localStorage.setItem("task-theme", "dark");
    mount();
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
  });
});
