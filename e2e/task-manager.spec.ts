import { expect, test } from "@playwright/test";

test("task CRUD, theme and language switching", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task Manager." })).toBeVisible();
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption("en");
  await page.getByPlaceholder("What needs to be done?").fill("Review technical case");
  await page.getByPlaceholder("Add some details").fill("Check requirements");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Review technical case")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("textbox", { name: "Edit title" }).fill("Review final case");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Review final case")).toBeVisible();
  await page.getByRole("checkbox", { name: /mark review final case as complete/i }).click();
  await expect(page.getByRole("checkbox", { name: /mark review final case as incomplete/i })).toBeChecked();
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption("pt");
  await expect(page.getByRole("heading", { name: "Criar tarefa" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByText("Review final case")).toHaveCount(0);
});

test("pagination loads the next page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption("en");
  for (let i = 0; i < 12; i++) {
    await page.getByPlaceholder("What needs to be done?").fill(`Pagination ${i}`);
    await page.getByRole("button", { name: "Add task" }).click();
    await expect(page.getByText(`Pagination ${i}`, { exact: true })).toBeVisible();
  }
  const tasks = page.locator("li");
  if (await page.getByRole("button", { name: "Load more tasks" }).isVisible()) {
    await page.getByRole("button", { name: "Load more tasks" }).click();
  }
  await expect(tasks).toHaveCount(12, { timeout: 15000 });
  await expect(page.getByText(/12 of 12 loaded/)).toBeVisible();
});
