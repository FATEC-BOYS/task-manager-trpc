import { expect, test } from "@playwright/test";

test("task CRUD, theme and language switching", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task Manager." })).toBeVisible();
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption("en");
  await page.getByPlaceholder("What needs to be done?").fill("Review technical case");
  await page.getByPlaceholder("Add some details").fill("Check requirements");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Review technical case")).toBeVisible();
  await page.locator("li").filter({ hasText: "Review technical case" }).getByRole("button", { name: "Edit" }).click();
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
  await page.locator("li").filter({ hasText: "Review final case" }).getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByText("Review final case")).toHaveCount(0);
});

test("pagination loads tasks across pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption("en");

  // Use unique names so this test does not depend on the in-memory store being empty.
  const prefix = `Pagination-${Date.now()}-`;
  for (let i = 0; i < 12; i++) {
    const title = `${prefix}${i}`;
    await page.getByPlaceholder("What needs to be done?").fill(title);
    await page.getByRole("button", { name: "Add task" }).click();
    // A newly created task might be beyond the first page; wait for the form to reset.
    await expect(page.getByPlaceholder("What needs to be done?")).toHaveValue("");
  }

  const ownTasks = page.locator("li").filter({ hasText: prefix });
  for (let pageNumber = 0; pageNumber < 10; pageNumber++) {
    if (await ownTasks.count() === 12) break;
    const more = page.getByRole("button", { name: "Load more tasks" });
    if (await more.isVisible()) {
      await more.click();
    } else {
      // The IntersectionObserver can load pages automatically.
      await page.waitForTimeout(300);
    }
  }
  await expect(ownTasks).toHaveCount(12, { timeout: 15000 });
});
