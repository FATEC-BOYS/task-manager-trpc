import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "./index";
import { taskStore } from "../store";

const caller = createCaller({});
beforeEach(() => {
  for (const task of taskStore.list()) taskStore.remove(task.id);
});

describe("tRPC task procedures", () => {
  it("validates required title", async () => {
    await expect(caller.tasks.create({ title: "  ", description: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("supports CRUD", async () => {
    const created = await caller.tasks.create({ title: "Write tests", description: "Vitest" });
    expect((await caller.tasks.list()).some((task) => task.id === created.id)).toBe(true);
    const updated = await caller.tasks.update({ id: created.id, completed: true });
    expect(updated.completed).toBe(true);
    expect(await caller.tasks.delete({ id: created.id })).toEqual({ success: true });
    await expect(caller.tasks.delete({ id: created.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("paginates tasks", async () => {
    for (let i = 0; i < 12; i++) await caller.tasks.create({ title: `Task ${i}`, description: "" });
    const first = await caller.tasks.infinite({ cursor: 0, limit: 10 });
    expect(first.items).toHaveLength(10);
    expect(first.nextCursor).toBe(10);
    const second = await caller.tasks.infinite({ cursor: first.nextCursor, limit: 10 });
    expect(second.items).toHaveLength(2);
    expect(second.nextCursor).toBeNull();
    expect(new Set([...first.items, ...second.items].map((task) => task.id)).size).toBe(12);
  });
});
