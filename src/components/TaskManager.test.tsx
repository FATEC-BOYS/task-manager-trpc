import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import { TaskManager } from "./TaskManager";

const mocks = vi.hoisted(() => ({
  invalidate: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
  fetchNextPage: vi.fn(), items: [] as Array<{ id: string; title: string; description: string; completed: boolean; createdAt: string }>,
  hasNextPage: false
}));
vi.mock("@/utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ tasks: { infinite: { invalidate: mocks.invalidate } } }),
    tasks: {
      infinite: { useInfiniteQuery: () => ({
        data: { pages: [{ items: mocks.items, total: mocks.items.length, nextCursor: mocks.hasNextPage ? 10 : null }] },
        fetchNextPage: mocks.fetchNextPage, hasNextPage: mocks.hasNextPage,
        isFetchingNextPage: false, isFetching: false, error: null
      }) },
      create: { useMutation: (opts: { onSuccess: () => void }) => ({
        mutate: (value: unknown) => { mocks.create(value); opts.onSuccess(); }, isPending: false
      }) },
      update: { useMutation: (opts: { onSuccess: () => void }) => ({
        mutate: (value: unknown) => { mocks.update(value); opts.onSuccess(); }, isPending: false
      }) },
      delete: { useMutation: (opts: { onSuccess: () => void }) => ({
        mutate: (value: unknown) => { mocks.remove(value); opts.onSuccess(); }, isPending: false
      }) }
    }
  }
}));
vi.mock("./ThemeToggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
vi.mock("./LanguageToggle", () => ({ LanguageToggle: () => <button>Language</button> }));

function mount() {
  return render(<NextIntlClientProvider locale="en" messages={messages.en}>
    <TaskManager initialPage={{ items: mocks.items, total: mocks.items.length, nextCursor: null }} />
  </NextIntlClientProvider>);
}
const task = { id: "0d6c6ec5-8d7a-4e93-bca5-87c6df9b7e9a", title: "Test task", description: "Details", completed: false, createdAt: new Date().toISOString() };

describe("TaskManager interactions", () => {
  beforeEach(() => {
    mocks.items = []; mocks.hasNextPage = false;
    mocks.create.mockClear(); mocks.update.mockClear(); mocks.remove.mockClear(); mocks.invalidate.mockClear();
  });
  it("renders empty state and validates title", () => {
    mount();
    expect(screen.getByText("No tasks yet. Create your first one above.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Title" })).toBeRequired();
  });
  it("submits a new task and refreshes the query", async () => {
    mount();
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), { target: { value: "New task" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Add task" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ title: "New task", description: "" }));
    expect(mocks.invalidate).toHaveBeenCalled();
  });
  it("edits, completes and deletes a task", () => {
    mocks.items = [task];
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit title" }), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(mocks.update).toHaveBeenCalledWith({ id: task.id, title: "Updated", description: "Details" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Mark Test task as complete" }));
    expect(mocks.update).toHaveBeenCalledWith({ id: task.id, completed: true });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(mocks.remove).toHaveBeenCalledWith({ id: task.id });
  });
  it("provides manual pagination fallback", () => {
    mocks.items = [task]; mocks.hasNextPage = true;
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Load more tasks" }));
    expect(mocks.fetchNextPage).toHaveBeenCalled();
  });
});
